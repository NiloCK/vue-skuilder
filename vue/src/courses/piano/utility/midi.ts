import webmidi, { WebMidi, Input, Output, InputEventBase, IEventNote, InputEventNoteoff, InputEventNoteon } from 'webmidi';

export interface NoteEvent {
  note: IEventNote;
  velocity: number;
  timestamp: number;
  type: 'noteon' | 'noteoff'
}

export function eventsToSyllableSequence(midi: NoteEvent[]): SyllableSequence {
  const syllables: Syllable[] = [];
  midi = midi.filter(e => e.type === 'noteon')
    .sort((a, b) => a.timestamp - b.timestamp);

  for (let chordSize = 10; chordSize > 0; chordSize--) {
    for (let i = 0; i < midi.length - chordSize + 1; i++) {
      try {
        syllables.push(new Syllable(midi.slice(i, i + chordSize)));
        midi.splice(i, chordSize);
      } catch {
        // console.log(`awef`);
      }
    }
  }

  return new SyllableSequence(syllables);
}

class SyllableSequence {
  syllables: Syllable[];
  rootNote: IEventNote;

  /**
   *
   */
  constructor(syllables: Syllable[]) {
    this.syllables = syllables.sort((a, b) => {
      return a.timestamp - b.timestamp
    });
    this.rootNote = this.syllables[0].notes.reduce((lowest, current) => {
      return current.note.number < lowest.note.number ? current : lowest;
    }).note;
  }

  public grade(answer: SyllableSequence): SyllableSequence {
    for (let i = 0; i < this.syllables.length; i++) {

      // handling missing notes in a syllable
      if (this.syllables[i].notes.length !== answer.syllables[i].notes.length) {
        answer.syllables[i].isCorrect = false;
      }

      // this.syllables[i].notes.forEach((note) => {
      //   const ansNote = answer.syllables[i].notes.find( (n) => {
      //     const sameName = n.note.name === note.note.name;
      //     const sameDiff = n.note.number - this.rootNote.number ===
      //                      note.note.number - answer.rootNote.number
      //     return sameName && sameDiff;
      //   });
      //   if (ansNote) {

      //   }
      // })

      for (let j = 0; j < this.syllables[i].notes.length; j++) {
        const notTheSameNote = this.syllables[i].notes[j].note.name !==
          answer.syllables[i].notes[j].note.name;
        const notTheSameInterval =
          this.syllables[i].notes[j].note.number - this.rootNote.number !==
          answer.syllables[i].notes[j].note.number - answer.rootNote.number;

        if (notTheSameInterval || notTheSameNote) {
          answer.syllables[i].notes[j].isCorrect = false;
          answer.syllables[i].isCorrect = false;
        }
      }
    }

    return answer;
  }

  public toString(): string {
    let ret = "";
    this.syllables.forEach((s, i) => {
      ret += `Syllable ${i}: {\n`
      s.notes.forEach((n) => {
        ret += `\t${n.note.name}\t${n.note.number}\t${n.timestamp}\n`
      });
      ret += `} - ${s.timestamp}, correct: ${s.isCorrect}\n`
    });
    return ret;
  }

  public isCorrect(): boolean {
    let ret = true;
    this.syllables.forEach((s) => {
      if (s.isCorrect === false) {
        return false;
      } else {
        s.notes.forEach(n => {
          if (n.isCorrect === false) {
            return false;
          }
        })
      }
    })
    return ret;
  }
}


class Syllable {
  notes: (NoteEvent & { isCorrect: boolean })[];
  isCorrect: boolean;

  get timestamp(): number {
    let timestamp = 0;
    this.notes.forEach((n) => {
      if (n.timestamp === 0) {
        return 0;
      } else {
        timestamp += n.timestamp
      }
    });
    timestamp /= this.notes.length;
    return timestamp;
  };

  /**
   *
   */
  constructor(notes: NoteEvent[]) {
    notes = notes.filter((note) => {
      return note.type === 'noteon';
    });

    const minTimestamp = notes.reduce((min, current) => {
      if (min.timestamp < current.timestamp) {
        return min;
      } else {
        return current;
      }
    });
    const maxTimestamp = notes.reduce((max, current) => {
      if (max.timestamp > current.timestamp) {
        return max;
      } else {
        return current;
      }
    });
    const timespan = maxTimestamp.timestamp - minTimestamp.timestamp;

    if (Syllable.gracePeriod(notes.length) < timespan) {
      throw new Error(`Notes ${notes.toString()} are not close enough together to be a syllable`);
    } else {
      this.notes = notes.map((note) => {
        return {
          ...note,
          isCorrect: true
        }
      }).sort((a, b) => {
        return a.note.number - b.note.number;
      });
    }
  }

  /**
   * Returns the size of a timespan (in ms) that
   * a n-note chord must be contained within
   * @param n number of notes
   */
  private static gracePeriod(n: number): number {
    const sequentialEventsLowerBound = 12;
    return 1.3 * sequentialEventsLowerBound * n;
  }
}

class SkMidi {
  private static _instance: SkMidi;
  public recording: NoteEvent[] = [];

  private webmidi: WebMidi = webmidi;
  private input: Input;
  private output: Output;

  private constructor() { }

  private async init(): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
      this.webmidi.enable((err) => {
        if (err) {
          console.log(`Webmidi not enabled: ${err}`);
          reject(err);
        } else {
          console.log(`Webmidi enabled`);

          // Viewing available inputs and outputs
          console.log(`Inputs: ${JSON.stringify(this.webmidi.inputs)}`);
          console.log(`Outputs: ${JSON.stringify(this.webmidi.outputs)}`);

          this.output = this.webmidi.outputs[0];
          this.input = this.webmidi.inputs[0];
          resolve();
        }
      });
    })

  }

  public get hasRecording(): boolean {
    return this.record.length > 0;
  }

  public get configuredInput(): string {
    if (this.input) {
      return `${this.input.manufacturer}: ${this.input.name}`;
    } else {
      return "(Not Sure!)";
    }
  }

  public eraseRecording() {
    this.recording = [];
  }

  public stopRecording() {
    this.input.removeListener();
  }

  public record() {
    let initTimestamp: number = 0;

    if (this.input === undefined) {
      throw new Error(`Midi input not configured!`);
    }
    if (this.input.connection === 'open') {

      // remove previously attached listeners
      this.stopRecording();
      // clear previously recorded data
      this.eraseRecording();

      this.input.on("noteon", "all", (e) => {
        if (this.recording.length === 0) {
          initTimestamp = e.timestamp;
        }
        console.log(`${e.note.name} - time: ${e.timestamp}`);
        this.recording.push({
          note: e.note,
          type: e.type,
          velocity: e.velocity,
          timestamp: e.timestamp - initTimestamp
        });
      });
      this.input.on('noteoff', 'all', (e) => {
        if (this.recording.length === 0) {
          initTimestamp = e.timestamp;
        }
        console.log(e.note.name + ' off');
        this.recording.push({
          note: e.note,
          velocity: e.velocity,
          type: e.type,
          timestamp: e.timestamp - initTimestamp
        });
      })
    }
  }

  public addNoteonListenter(f: (e: InputEventNoteon) => void) {
    this.input.on('noteon', 'all', f);
  }
  public addNoteoffListenter(f: (e: InputEventNoteoff) => void) {
    this.input.on('noteoff', 'all', f);
  }

  public play(recording?: NoteEvent[]) {
    let playbackData: NoteEvent[] = recording ? recording : this.recording;

    playbackData.forEach((e) => {
      if (e.type === 'noteon') {
        this.output.playNote(e.note.name + e.note.octave, 1, {
          velocity: e.velocity,
          time: `+${e.timestamp}`,
          rawVelocity: false
        });
      } else {
        this.output.stopNote(e.note.name + e.note.octave,
          1,
          {
            velocity: e.velocity,
            time: `+${e.timestamp}`,
            rawVelocity: false
          });
      }
    })
  }

  public static async factory(): Promise<SkMidi> {
    console.log(`Buzz, whirr, Midi factory is at work`);
    let ret = new SkMidi();
    await ret.init();
    return ret;
  }

  public static async instance(): Promise<SkMidi> {
    if (SkMidi._instance && SkMidi._instance.webmidi && SkMidi._instance.webmidi.enabled) {
      return SkMidi._instance;
    } else {
      console.log(`Buzz, whirr, Midi factory is at work`);
      SkMidi._instance = new SkMidi();
      await SkMidi._instance.init();
      return SkMidi._instance;
    }

  }

  public get inputs(): Input[] {
    return this.webmidi.inputs;
  }
  public get outputs(): Output[] {
    return this.webmidi.outputs;
  }
  public selectInput(id: string): void {
    if (this.webmidi.getInputById(id) !== false) {
      this.input = this.webmidi.getInputById(id) as Input;
    }
  }

  public selectOuput(index: number): void {
    this.output = this.outputs[index];
  }
}

export default SkMidi;
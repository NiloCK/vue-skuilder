import webmidi, { WebMidi, Input, Output, InputEventBase, IEventNote } from 'webmidi';

export interface NoteEvent {
  note: IEventNote;
  velocity: number;
  timestamp: number;
  type: 'noteon' | 'noteoff'
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

  public record() {
    let initTimestamp: number = 0;

    if (this.input === undefined) {
      throw new Error(`Midi input not configured!`);
    }
    if (this.input.connection === 'open') {
      // clear previously recorded data
      this.recording = [];
      // remove previously attached listeners
      this.input.removeListener();

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
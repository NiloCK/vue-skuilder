import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { eventsToSyllableSequence, NoteEvent } from '../../utility/midi';
import Playback from './Playback.vue';

const fields: FieldDefinition[] = [
  {
    name: 'Melody',
    type: FieldType.MIDI,
  },
];

export class EchoQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      fields,
      name: DataShapeName.PIANO_Echo,
    },
  ];

  public static views = [Playback];

  public midi: NoteEvent[];

  constructor(data: ViewData[]) {
    super(data);
    this.midi = (data[0].Melody as any) as NoteEvent[];
  }

  /**
   * The duration of the recording in milliseconds
   */
  public get duration(): number {
    return this.midi.reduce((max, current) => {
      if (current.timestamp > max.timestamp) {
        return current;
      } else {
        return max;
      }
    }).timestamp;
  }

  /**
   * The time (in MS) at which the last note in
   * recording is played
   */
  public get lastNoteOnTimestamp(): number {
    return this.midi
      .filter((e) => e.type === 'noteon')
      .reduce((max, current) => {
        if (current.timestamp > max.timestamp) {
          return current;
        } else {
          return max;
        }
      }).timestamp;
  }

  public isCorrect(answer: NoteEvent[]): boolean {
    const firstNoteNumber = this.midi[0].note.number;

    const onMidi = this.midi.filter((e) => e.type === 'noteon');
    const onAnswer = answer.filter((e) => e.type === 'noteon');

    const qSylSeq = eventsToSyllableSequence(this.midi);
    const aSylSeq = eventsToSyllableSequence(answer);

    try {
      const gradedSeq = qSylSeq.grade(aSylSeq);
      return gradedSeq.isCorrect();
    } catch (e) {
      console.log(`ERROR grading this midi sequence!`);
      return false;
    }

    // console.log(`Sequence is correct: ${gradedSeq.isCorrect()}`);
    // if (gradedSeq.isCorrect()) {
    //   console.log(`The correct sequence: \n${gradedSeq}`);
    // }

    // if (answer.length !== this.midi.length) {
    //   log(`Input length and answer length not equal...`);
    //   return false;
    // }

    // for (let i = 0; i < Math.min(onAnswer.length, onMidi.length); i++) {
    //   if (onAnswer[i].note.name !== onMidi[i].note.name ||
    //     onAnswer[i].note.number - onAnswer[0].note.number !==
    //     onMidi[i].note.number - onMidi[0].note.number
    //   ) {
    //     return false || gradedSeq.isCorrect();
    //   }
    // }
    // return true;
  }

  public dataShapes(): DataShape[] {
    return EchoQuestion.dataShapes;
  }
  public views() {
    return EchoQuestion.views;
  }
}

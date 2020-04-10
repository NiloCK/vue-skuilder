import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import Playback from './Playback.vue';
import { NoteEvent } from '../../utility/midi';

const fields: FieldDefinition[] = [
  {
    name: 'Melody',
    type: FieldType.MIDI
  }
];

export class EchoQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      fields,
      name: DataShapeName.PIANO_Echo
    }
  ];

  public static views = [
    Playback
  ];

  public midi: NoteEvent[];

  constructor(data: ViewData[]) {
    super(data);
    this.midi = data[0].Melody as any as NoteEvent[];
  }


  public isCorrect(answer: NoteEvent[]): boolean {
    let onMidi = this.midi.filter(e => e.type === "noteon");
    let onAnswer = answer.filter(e => e.type === 'noteon');

    if (onAnswer.length === onMidi.length) {
      for (let i = 0; i < onAnswer.length; i++) {
        if (onAnswer[i].note.number != onMidi[i].note.number) {
          return false;
        }
      }
      return true;
    } else {
      throw new Error(`Midi answer length not equal to question length...`);
    }
  }
  public dataShapes(): DataShape[] {
    return EchoQuestion.dataShapes;
  }
  public views() {
    return EchoQuestion.views;
  }
}

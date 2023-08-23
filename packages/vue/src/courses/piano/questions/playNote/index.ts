import { Question } from '../../../../base-course/Displayable';
import { DataShape } from '../../../../base-course/Interfaces/DataShape';
import { FieldDefinition } from '../../../../base-course/Interfaces/FieldDefinition';
import { ViewData } from '../../../../base-course/Interfaces/ViewData';
import { DataShapeName } from '../../../../enums/DataShapeNames';
import { FieldType } from '../../../../enums/FieldType';
import { NoteEvent } from '../../utility/midi';
import NotePlayback from './NotePlayback.vue';

const fields: FieldDefinition[] = [
  {
    name: 'Note',
    type: FieldType.STRING,
  },
];

export const inputs: string[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'A♯', // sharps
  'C♯',
  'D♯',
  'F♯',
  'G♯',
  'D♭', // flats
  'E♭',
  'G♭',
  'A♭',
  'B♭',
];

export class PlayNote extends Question {
  public static dataShapes: DataShape[] = [
    {
      fields,
      name: DataShapeName.PIANO_PlayNote,
    },
  ];

  public static seedData = inputs.map((n) => {
    return {
      Note: n,
    };
  });

  public static views = [NotePlayback];

  public note: string;

  constructor(data: ViewData[]) {
    super(data);
    this.note = (data[0].Note as any) as string;
  }

  public isCorrect(answer: NoteEvent[]): boolean {
    return answer[0].note.name === this.note;
  }

  public dataShapes(): DataShape[] {
    return PlayNote.dataShapes;
  }
  public views() {
    return PlayNote.views;
  }
}

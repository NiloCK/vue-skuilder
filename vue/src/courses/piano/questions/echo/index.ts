import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Answer } from '../../../../base-course/Displayable';
import Playback from './Playback.vue';

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

  public midi: string;

  constructor(data: ViewData[]) {
    super(data);
    this.midi = data[0].Melody as string;
  }


  public isCorrect(answer: Answer): boolean {
    return answer === this.midi;
  }
  public dataShapes(): DataShape[] {
    return EchoQuestion.dataShapes;
  }
  public views() {
    return EchoQuestion.views;
  }
}

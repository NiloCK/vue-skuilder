import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { NonEmptyString } from '@/base-course/Validators';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Answer } from '../../../../base-course/Displayable';
import IdentifyVocab from './identify.vue';

const fields: FieldDefinition[] = [
  {
    name: 'word',
    type: FieldType.STRING,
    validator: NonEmptyString
  },
  {
    name: 'image',
    type: FieldType.IMAGE
  },
  {
    name: 'audio',
    type: FieldType.AUDIO
  }
];

export class VocabQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      fields,
      name: DataShapeName.FRENCH_Vocab
    }
  ];

  public static views = [
    IdentifyVocab
  ];

  public isCorrect(answer: Answer): boolean {
    throw new Error('Method not implemented.');
  }
  public dataShapes(): DataShape[] {
    return VocabQuestion.dataShapes;
  }
  public views() {
    return VocabQuestion.views;
  }
}

import { RadioSelectAnswer } from '../../../../base-course/Components/RadioMultipleChoice.vue';
import { Question } from '../../../../base-course/Displayable';
import { DataShapeName } from '../../../../enums/DataShapeNames';
import { FieldType } from '../../../../enums/FieldType';
import { Status } from '../../../../enums/Status';
import IdentifyKeyView from './IdentifyKey.vue';

/**
 * The 15 sane keys in music theory.
 */
export const keys = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'F',
  'Bb',
  'Eb',
  'Ab',
  'Db',
  'Gb',
  'Cb',
];

export class IdentifyKeyQuestion extends Question {
  public static dataShapes = [
    {
      name: DataShapeName.SIGHTSING_IdentifyKey,
      fields: [
        {
          name: 'key',
          type: FieldType.NUMBER,
          validator: {
            test: (value: string) => {
              const num = parseInt(value);
              return num >= 0 && num <= keys.length
                ? {
                    msg: '',
                    status: Status.ok,
                  }
                : {
                    msg: 'Please enter a number between 0 and 11',
                    status: Status.error,
                  };
            },
          },
        },
      ],
    },
  ];
  public static views = [IdentifyKeyView];
  public key: string;

  static getKey(value: number): string {
    return keys[value];
  }

  constructor(data: any[]) {
    super(data);
    this.key = IdentifyKeyQuestion.getKey(data[0].key as number);
  }

  public isCorrect(answer: RadioSelectAnswer): boolean {
    console.log(`answer: ${JSON.stringify(answer)}, key: ${this.key}`);
    return this.key === answer.choiceList[answer.selection];
  }

  public dataShapes() {
    return IdentifyKeyQuestion.dataShapes;
  }
  public views() {
    return IdentifyKeyQuestion.views;
  }
}

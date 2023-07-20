import { Answer, Question } from '../../../../base-course/Displayable';
import { FieldDefinition } from '../../../../base-course/Interfaces/FieldDefinition';
import { ViewData } from '../../../../base-course/Interfaces/ViewData';
import { DataShapeName } from '../../../../enums/DataShapeNames';
import { FieldType } from '../../../../enums/FieldType';
import { Status } from '../../../../enums/Status';
import AngleCategorizeV from './angleCategorize.vue';
import _ from 'lodash';
import { RadioMultipleChoiceAnswer } from '../../../../base-course/Interfaces/AnswerInterfaces';

const validator = {
  instructions: 'Must be "ACUTE", "RIGHT", "OBTUSE", "STRAIGHT", or "REFLEX".',
  test: (value: string) => {
    if (
      value === AngleCategories.ACUTE ||
      value === AngleCategories.OBTUSE ||
      value === AngleCategories.REFLEX ||
      value === AngleCategories.RIGHT ||
      value === AngleCategories.STRAIGHT
    ) {
      return {
        status: Status.ok,
        msg: '',
      };
    } else {
      return {
        status: Status.error,
        msg: 'Must be "ACUTE", "RIGHT", "OBTUSE", "STRAIGHT", or "REFLEX".',
      };
    }
  },
};

export enum AngleCategories {
  ACUTE = 'ACUTE',
  RIGHT = 'RIGHT',
  OBTUSE = 'OBTUSE',
  STRAIGHT = 'STRAIGHT',
  REFLEX = 'REFLEX',
}

const fields: FieldDefinition[] = [
  {
    name: 'Category',
    type: FieldType.STRING,
    validator,
  },
];

export class AngleCategorize extends Question {
  public static dataShapes = [
    {
      name: DataShapeName.MATH_AngleCategorize,
      fields,
    },
  ];

  public static views = [AngleCategorizeV];

  public angleCategory: AngleCategories;
  public answers: string[];

  constructor(data: ViewData[]) {
    super(data);
    this.angleCategory = data[0].Category as AngleCategories;
    this.answers = _.shuffle([
      AngleCategories.ACUTE,
      AngleCategories.OBTUSE,
      AngleCategories.REFLEX,
      AngleCategories.RIGHT,
      AngleCategories.STRAIGHT,
    ]);
  }

  public isCorrect(answer: RadioMultipleChoiceAnswer) {
    return this.angleCategory.valueOf() === answer.choiceList[answer.selection];
  }

  public dataShapes() {
    return AngleCategorize.dataShapes;
  }

  public views() {
    return AngleCategorize.views;
  }
}

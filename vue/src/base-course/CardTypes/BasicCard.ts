// import { Displayable, Question } from '@/base-course/Course';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import BasicView from './BasicCardView.vue';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { Question } from '@/base-course/Displayable';
import { DataShape } from '../Interfaces/DataShape';

export const BasicCardDataShapes: DataShape[] = [
  {
    name: DataShapeName.Basic,
    fields: [
      {
        name: 'Front',
        type: FieldType.MARKDOWN
      },
      {
        name: 'Back',
        type: FieldType.MARKDOWN
      }
    ]
  }
];

export default class BasicCard extends Question {
  public static dataShapes = BasicCardDataShapes;
  public static views = [
    BasicView
  ];
  constructor(data: ViewData[]) {
    super(data);
  }

  public isCorrect() {
    return true;
  }

  public dataShapes() {
    return BasicCard.dataShapes;
  }
  public views() {
    return BasicCard.views;
  }
}

export function CardTypes() {
  return [BasicCard];
}

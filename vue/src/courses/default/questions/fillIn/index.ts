import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import FillInView from './fillIn.vue';
import FillInText from './fillInText.vue';

export const BlanksCardDataShapes: DataShape[] = [
  {
    name: DataShapeName.Blanks,
    fields: [
      {
        name: 'Input',
        type: FieldType.STRING
      }
    ]
  }
];

interface FillInSection {
  type: 'text' | 'blank';
  text: string;
}

export class BlanksCard extends Question {
  public static dataShapes = BlanksCardDataShapes;
  public static views = [
    FillInView
  ];
  public mdText: string = '';
  constructor(data: ViewData[]) {
    super(data);
    this.mdText = data[0].Input as any as string;
  }

  public isCorrect() {
    return true;
  }

  public get sections(): FillInSection[] {
    return parseBlanksMarkdown(this.mdText);
  }

  public dataShapes() {
    return BlanksCard.dataShapes;
  }
  public views() {
    return BlanksCard.views;
  }
}

export function parseBlanksMarkdown(md: string): FillInSection[] {
  const ret: FillInSection[] = [];
  let blanksCount: number = 0;

  while (md.length > 0) {
    const i = md.indexOf('{{');

    if (i === 0) {
      const j = md.indexOf('}}');
      ret.push({
        text: md.substring(i, j + 1),
        type: 'blank'
      });
      md = md.substr(j + 1);
      blanksCount++;
    } else if (i === -1) {
      // no more blanks. push the rest of the string
      ret.push({
        type: 'text',
        text: md
      });
      md = '';
    } else {
      ret.push({
        type: 'blank',
        text: md.substring(0, i)
      });
      md = md.substr(i);
    }
  }

  if (blanksCount > 0) {
    return ret;
  } else {
    throw new Error('No blanks in this fill-in-the-blank question constructor string!');
  }
}

import { Answer, Question } from '@/base-course/Displayable';
import { RadioMultipleChoiceAnswer } from '@/base-course/Interfaces/AnswerInterfaces';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { Validator } from '@/base-course/Interfaces/Validator';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { randomInt } from '@/courses/math/utility';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import _ from 'lodash';
import { log } from 'util';
import FillInView from './fillIn.vue';

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

const val: Validator = {
  test: (input) => {
    const sections = parseBlanksMarkdown(input);
    let blanksCount: number = 0;
    sections.forEach((section) => {
      if (section.type === 'blank') {
        blanksCount++;
      }
    });

    if (blanksCount === 1) {
      return {
        status: Status.ok,
        msg: ''
      };
    } else {
      return {
        status: Status.error,
        msg: 'There must be exactly one blank of the form {{answer}} in the question'
      };
    }

  }
};

type fillInSectionType = 'text' | 'blank';

export interface FillInSection {
  type: fillInSectionType;
  text: string;
}

/**
 * Returns an array of 'correct' answers for this blank
 */
function getAnswers(section: FillInSection): string[] {
  // section.text is of the form '{{answer}}' or
  // '{{answer1|answer2|...||distractor1|distractor2|...}}'
  if (section.type === 'blank') {
    let text = section.text;
    // trimming the '{{}}'
    text = text.substring(2, text.length - 2);
    // taking the answer. note: 'answer'.split('||') == ['answer']
    // text = text.split('||')[0];
    const answersString = text.split('||')[0];
    const answers: string[] = answersString.split('|');
    return answers;
  } else {
    return [];
  }
}

export class BlanksCard extends Question {
  public static dataShapes = BlanksCardDataShapes;
  public static views = [
    FillInView
  ];
  public mdText: string = '';

  public answer: string | null = null;
  public options: string[] | null = null;

  constructor(data: ViewData[]) {
    super(data);
    this.mdText = data[0].Input as any as string;

    let blankCount: number = 0;
    let blankSection: FillInSection = {
      text: '{{}}',
      type: 'blank'
    };
    this.sections.forEach((section) => {
      if (section.type === 'blank') {
        blankCount++;
        blankSection = section;
      }
    });
    if (blankCount === 1) {
      let text: string = blankSection.text;
      text = text.substring(2);
      text = text.substring(0, text.length - 2);

      const split = text.split('||');
      if (split.length > 1) {
        const answers = split[0].split('|');
        const distractors = split[1].split('|');

        this.answer = answers[randomInt(0, answers.length - 1)];
        distractors.push(this.answer);
        this.options = distractors;
        this.options = _.shuffle(this.options);
      }
    }
  }


  public isCorrect(answer: Answer | Answer[]) {
    if (typeof answer === 'string') {
      return this.isCorrectStr(answer);
    }

    if (Array.isArray(answer)) {
      const filtered = answer.filter((ans) => {
        return typeof ans === 'string';
      });

      if (filtered.length === answer.length) {
        return this.isCorrectStr(answer as string[]);
      }
    }

    return this.isCorrectRadio(answer as RadioMultipleChoiceAnswer);
  }

  public dataShapes() {
    return BlanksCard.dataShapes;
  }
  public views() {
    return BlanksCard.views;
  }

  private isCorrectRadio(answer: RadioMultipleChoiceAnswer) {
    return this.isCorrectStr(answer.choiceList[answer.selection]);
  }

  private isCorrectStr(answer: string | string[]): boolean {
    const blankSections = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.sections.length; i++) {
      if (this.sections[i].type === 'blank') {
        blankSections.push(this.sections[i]);
      }
    }

    if (Array.isArray(answer)) {
      const scoreSheet: boolean[] = [];
      for (let i = 0; i < answer.length; i++) {
        scoreSheet.push(
          getAnswers(blankSections[i]).includes(answer[i])
        );
      }

      scoreSheet.forEach((score) => {
        if (score === false) {
          return false;
        }
      });
      return true;
    } else {
      return getAnswers(blankSections[0]).includes(answer);
    }
  }
  public get sections(): FillInSection[] {
    return parseBlanksMarkdown(this.mdText);
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
        text: md.substring(i, j + 2),
        type: 'blank'
      });
      md = md.substr(j + 2);
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
        type: 'text',
        text: md.substring(0, i)
      });
      md = md.substr(i);
    }
  }

  if (blanksCount > 0) {
    return ret;
  } else {
    log('No blanks in this fill-in-the-blank question constructor string!');
    return ret;
  }
}

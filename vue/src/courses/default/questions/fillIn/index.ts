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
import marked from 'marked';
import FillInView from './fillIn.vue';

function splitText(text: string, leftBound: string, rightBound: string): {
  left: string,
  middle: string,
  right: string
} {
  const leftSplit = text.split(leftBound);
  const left = leftSplit[0];

  const rightSplit = leftSplit[1].split(rightBound);
  const middle = rightSplit[0];
  const right = rightSplit[1];

  return { left, middle, right };
}

export function splitTextToken(token: marked.Tokens.Text): marked.Tokens.Text[] {
  if (containsComponent(token)) {
    const text = splitText(token.text, '{{', '}}');
    const raw = splitText(token.raw, '{{', '}}');

    let ret: marked.Tokens.Text[] = [];

    if (raw.left.length > 0) {
      ret.push({
        type: 'text',
        raw: raw.left,
        text: text.left
      });
    }
    if (raw.middle.length > 0) {
      ret.push({
        type: 'text',
        raw: "{{" + raw.middle + "}}",
        text: "{{" + text.middle + "}}"
      })
    }
    if (raw.right.length > 0) {
      ret.push({
        type: 'text',
        raw: raw.right,
        text: text.right
      });
    }

    return ret;
  } else {
    return [token];
  }
}

export function containsComponent(token: marked.Token) {
  if (token.type === 'text') {
    let opening = token.raw.indexOf('{{');
    let closing = token.raw.indexOf('}}');

    if (opening !== -1 && closing !== -1
      && closing > opening) {
      return true;
    }
  } else {
    return false;
  }
}

export function isComponent(token: marked.Token) {
  return token.type === 'text' &&
    token.text.startsWith('{{') &&
    token.text.endsWith('}}');
}

export const BlanksCardDataShapes: DataShape[] = [
  {
    name: DataShapeName.Blanks,
    fields: [
      {
        name: 'Input',
        type: FieldType.MARKDOWN
      }
    ]
  }
];

const val: Validator = {
  test: (input) => {
    console.log(`Testing md input: ${input}`);
    // const sections = parseBlanksMarkdown(input);
    // let blanksCount: number = 0;
    // sections.forEach((section) => {
    //   if (section.type === 'blank') {
    //     blanksCount++;
    //   }
    // });

    // if (blanksCount === 1) {
    return {
      status: Status.ok,
      msg: ''
    };
    // } else {
    //   return {
    //     status: Status.error,
    //     msg: 'There must be exactly one blank of the form {{answer}} in the question'
    //   };
    // }

  }
};

type fillInSectionType = 'text' | 'blank';

export interface FillInSection {
  type: fillInSectionType;
  text: string;
}

export class BlanksCard extends Question {
  public static dataShapes = BlanksCardDataShapes;
  public static views = [
    FillInView
  ];
  public mdText: string = '';

  public answers: string[] | null = null;
  public options: string[] | null = null;

  public splitTextToken(token: marked.Tokens.Text): marked.Tokens.Text[] {
    if (containsComponent(token)) {
      const text = splitText(token.text, '{{', '}}');
      const raw = splitText(token.raw, '{{', '}}');

      let ret: marked.Tokens.Text[] = [];

      if (raw.left.length > 0) {
        ret.push({
          type: 'text',
          raw: raw.left,
          text: text.left
        });
      }
      if (raw.middle.length > 0) {
        ret.push({
          type: 'text',
          raw: "{{" + raw.middle + "}}",
          text: "{{" + text.middle + "}}"
        })
      }
      if (raw.right.length > 0) {
        ret.push({
          type: 'text',
          raw: raw.right,
          text: text.right
        });
      }

      return ret;
    } else {
      return [token];
    }
  }

  recurseToken(tok: marked.Token): {
    answers: string[] | null,
    options: string[] | null
  } | null {
    if (tok.type === 'text') {
      if (isComponent(tok)) {
        const optsStr = tok.raw.substring(2, tok.raw.length - 2);
        // console.log(`Opts string: ${optsStr}, start ${start}, length ${length}`);
        console.log(`OptsStr trimmed to: ${optsStr}`);
        const split = optsStr.split('||');
        if (split.length > 1) {
          const answers = split[0].split('|');
          const distractors = split[1].split('|');

          distractors.push(answers[randomInt(0, answers.length - 1)]);
          return {
            answers,
            options: _.shuffle(distractors)
          }
        } else {
          return {
            answers: [optsStr],
            options: null
          };
        }
      }

      if (containsComponent(tok)) {
        const split = this.splitTextToken(tok as marked.Tokens.Text);
        for (let i = 0; i < split.length; i++) {
          if (isComponent(split[i])) {
            return this.recurseToken(split[i]);
          }
        }
      }
    }

    if ((tok as any).tokens) {
      for (let i = 0; i < (tok as any).tokens.length; i++) {
        const candidate = this.recurseToken((tok as any).tokens[i]);
        if (candidate !== null) {
          return candidate;
        }
      }
    }

    return null;
  }

  constructor(data: ViewData[]) {
    super(data);
    this.mdText = data[0].Input as any as string;
    const tokens = marked.lexer(this.mdText);
    for (let i = 0; i < tokens.length; i++) {
      const parsedOptions = this.recurseToken(tokens[i]);
      if (parsedOptions !== null) {
        this.answers = parsedOptions.answers;
        this.options = parsedOptions.options;
        break;
      }
    }
  }

  public isCorrect(answer: Answer | Answer[]) {
    if (typeof answer === 'string') {
      if (this.answers) {
        return this.answers.includes(answer);
      } else {
        throw new Error(`Question has no known answers!`);
      }
    } else {
      return this.isCorrectRadio(answer as RadioMultipleChoiceAnswer);
    }
  }

  public dataShapes() {
    return BlanksCard.dataShapes;
  }
  public views() {
    return BlanksCard.views;
  }

  private isCorrectRadio(answer: RadioMultipleChoiceAnswer) {
    if (this.answers) {
      return this.answers.includes(answer.choiceList[answer.selection]);
    } else {
      return false;
    }
  }
}

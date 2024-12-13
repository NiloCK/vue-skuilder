// index.ts
import { Answer, Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import LetterQuestionView from './typeSingleLetter.vue';

const data = function() {
  let ret: { letter: string }[] = [];
  for (let i = 0; i < 26; i++) {
    ret.push({
      letter: String.fromCharCode(65 + i),
    });
  }
  return ret;
};

export class TypeLetterQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      name: DataShapeName.TYPING_singleLetter,
      fields: [
        {
          name: 'letter',
          type: FieldType.STRING,
          validator: {
            instructions: 'Enter a single letter',
            test: function(s: string) {
              if (!s || s.length !== 1 || !/[a-zA-Z]/.test(s)) {
                return {
                  status: Status.error,
                  msg: 'Input must be a single letter',
                };
              }
              return {
                status: Status.ok,
                msg: '',
              };
            },
          },
        },
      ],
    },
  ];

  public static views = [LetterQuestionView];
  public static acceptsUserData: boolean = true;

  public letter: string;
  public static seedData = data();

  constructor(data: ViewData[]) {
    super(data);
    this.letter = data[0].letter as string;
  }

  evaluate(a: Answer, t: number) {
    return {
      isCorrect: this.isCorrect(a),
      performance: this.displayedSkill(a, t),
    };
  }

  displayedSkill(a: Answer, t: number) {
    return this.isCorrect(a) ? 1.0 : 0.0;
  }

  dataShapes() {
    return TypeLetterQuestion.dataShapes;
  }

  views() {
    return TypeLetterQuestion.views;
  }

  isCorrect(a: Answer) {
    let isCorrect = (a as string).toLowerCase() === this.letter.toLowerCase();
    console.log(`singleLetter Q isCorrect: ${isCorrect}`);
    return isCorrect;
  }
}

// vue/src/courses/typing/questions/falling-letters/index.ts
import { Answer, Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import FallingLettersView from './FallingLetters.vue';

const data = function() {
  return [
    {
      gameLength: 30, // 30 seconds game
      initialSpeed: 2, // Initial fall speed
      acceleration: 0.1, // Speed increase per second
    },
  ];
};

export class FallingLettersQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      name: DataShapeName.TYPING_fallingLetters,
      fields: [
        {
          name: 'gameLength',
          type: FieldType.NUMBER,
        },
        {
          name: 'initialSpeed',
          type: FieldType.NUMBER,
        },
        {
          name: 'acceleration',
          type: FieldType.NUMBER,
        },
      ],
    },
  ];

  public static views = [FallingLettersView];
  public static acceptsUserData: boolean = true;
  public static seedData = data();

  public gameLength: number;
  public initialSpeed: number;
  public acceleration: number;

  constructor(data: ViewData[]) {
    super(data);
    this.gameLength = data[0].gameLength as number;
    this.initialSpeed = data[0].initialSpeed as number;
    this.acceleration = data[0].acceleration as number;
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
    return FallingLettersQuestion.dataShapes;
  }

  views() {
    return FallingLettersQuestion.views;
  }

  isCorrect(a: Answer) {
    return a === 'win';
  }
}

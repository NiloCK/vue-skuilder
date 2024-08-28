import { Answer, Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import PuzzleView from './puzzle.vue';

export class Puzzle extends Question {
  public static dataShapes: DataShape[] = [
    {
      name: DataShapeName.CHESS_puzzle,
      fields: [
        {
          name: 'fen',
          type: FieldType.STRING,
          validator: {
            instructions: 'insert a valid fen string',
            test: function (s: string) {
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
  public static views = [PuzzleView];
  public static acceptsUserData: boolean = true;

  public fen: string;

  constructor(data: ViewData[]) {
    super(data);
    this.fen = data[0].fen as string;
  }

  evaluate(a: Answer, t: number) {
    return {
      isCorrect: this.isCorrect(a),
      performance: this.displayedSkill(a, t),
    };
  }
  displayedSkill(a: Answer, t: number) {
    return 1000;
  }
  dataShapes() {
    return Puzzle.dataShapes;
  }

  views() {
    return Puzzle.views;
  }

  isCorrect(a: Answer) {
    return true;
  }
}

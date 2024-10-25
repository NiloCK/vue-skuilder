import { Answer, Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import PuzzleView from './puzzle.vue';
import { Key as cgKey } from '../../chessground/types';

export class Puzzle extends Question {
  public static dataShapes: DataShape[] = [
    {
      name: DataShapeName.CHESS_puzzle,
      fields: [
        {
          name: 'puzzleData', // see https://database.lichess.org/#puzzles
          type: FieldType.STRING,
          validator: {
            instructions: 'insert a valid fen string',
            test: function(s: string) {
              console.log('running puzzle validator...');
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

  public static readonly CHECKMATE = 'CHECKMATE';

  public fen: string;
  id: string;
  moves: string[];
  rating: number;
  themes: string[];

  constructor(data: ViewData[]) {
    super(data);

    const [id, fen, movesStr, rating, , , , themes] = (data[0].puzzleData as string).split(',');
    this.id = id;
    this.fen = fen;
    this.moves = movesStr.split(' ');
    this.rating = parseInt(rating, 10);
    this.themes = themes.split(' ');
    // this.fen = data[0].fen as string;
  }

  public checkMove = (orig: cgKey, dest: cgKey) => {
    alert('checkMove');
    console.log('checkMove', orig, dest);
    console.log('this.moves[0]', this.moves[0]);

    if (this.moves[0] === dest) {
      return true;
    } else {
      return false;
    }
  };

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
    // player actions have exhausted the move tree
    const sequenceComplete = this.moves.length === 0;

    return a === Puzzle.CHECKMATE || sequenceComplete;
  }
}

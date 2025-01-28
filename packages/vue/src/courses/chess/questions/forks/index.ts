// src/courses/chess/questions/forks/index.ts
import { Question, ViewComponent } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { Chess, Piece, Square, Color, PieceSymbol } from 'chess.js';
import ForksView from './forksView.vue';
import { Status } from '@/enums/Status';
import { FieldType } from '@/enums/FieldType';
import { DataShapeName } from '@/enums/DataShapeNames';
import ChessUtils from '../../chessUtils';

export interface ForkPosition {
  fen: string;
  solutions: string[]; // squares where forks exist
  pieceType: Piece;
  value: number; // material value of the best fork
}

interface PlacedEnemies {
  pieces: Map<Square, Piece>; // The placed enemy pieces
  forkSquares: Square[]; // Squares where forks exist (if any)
  value: number; // Total material value of the best fork
}

const forksDataShape: DataShape = {
  name: DataShapeName.CHESS_forks,
  fields: [
    {
      name: 'Piece',
      type: FieldType.STRING,
      validator: {
        instructions: 'Enter the piece type (n, b, r, q, p or k)',
        test: (s: string) => {
          return ['n', 'b', 'r', 'q', 'p', 'k'].includes(s.toLowerCase())
            ? { status: Status.ok, msg: '' }
            : { status: Status.error, msg: 'Invalid piece type - choose n, b, r, q, p or k' };
        },
      },
    },
    {
      name: 'Maximum Enemies',
      type: FieldType.NUMBER,
      validator: {
        instructions: 'Enter the maximum number of enemies the piece can fork',
        test: (s: string) => {
          const n = parseInt(s);
          return n >= 2 && n <= 8
            ? { status: Status.ok, msg: '' }
            : { status: Status.error, msg: 'Invalid number of enemies' };
        },
      },
    },
    {
      name: 'Number of Exercises',
      type: FieldType.NUMBER,
      validator: {
        instructions: 'Enter the number of exercises to generate',
        test: (s: string) => {
          const n = parseInt(s);
          return n >= 1 && n <= 10
            ? { status: Status.ok, msg: '' }
            : { status: Status.error, msg: 'Invalid number of exercises' };
        },
      },
    },
  ],
};

export class ForkFinder extends Question {
  public static dataShapes: DataShape[] = [forksDataShape]; // This exercise is self-generating
  public static views = [ForksView];
  public static acceptsUserData = false;

  private positions: ForkPosition[];
  private currentPositionIndex: number = 0;
  private maxEnemyCount: number;
  private exerciseCount: number;
  private pieceType: Piece;

  private playerColor: Color = Math.random() > 0.5 ? 'w' : 'b';

  public dataShapes(): DataShape[] {
    return [forksDataShape];
  }

  public views(): ViewComponent[] {
    return [ForksView];
  }

  constructor(data: ViewData[]) {
    super(data);
    this.maxEnemyCount = data[0]['Maximum Enemies'] as number;
    this.exerciseCount = data[0]['Number of Exercises'] as number;

    this.pieceType = {
      color: this.playerColor,
      type: data[0]['Piece'] as PieceSymbol,
    };

    console.log(`[fork] player piece: ${this.pieceType.type}, ${this.pieceType.color}`);

    this.positions = this.generatePositions(this.exerciseCount);
  }

  private generatePositions(numPositions: number): ForkPosition[] {
    const positions: ForkPosition[] = [];
    const pieceType = this.pieceType;
    // const maxEnemies = this.maxEnemyCount;

    for (let i = 0; i < numPositions; i++) {
      // Generate 5 positions
      const chess = new Chess();

      const startingFen = '8/8/8/8/8/8/8/8 ' + this.playerColor + ' - - 0 1';
      chess.load(startingFen, {
        skipValidation: true,
      });

      // 1. Choose whether this position should contain a fork (80% chance)
      const shouldHaveFork = Math.random() <= 1;

      console.log(`[fork] should have fork: ${shouldHaveFork}`);

      // 2. Place the attacking piece
      const attackerSquare = this.chooseAttackerPosition(pieceType);
      console.log(`[fork] piece placed at ${attackerSquare}`);
      chess.put(pieceType, attackerSquare);

      // 3. Place enemy pieces
      const enemyPlacement = this.placeEnemyPieces(chess, attackerSquare, shouldHaveFork);

      // 4. Remove the attacker piece
      chess.remove(attackerSquare);

      // Store the position info (we'll add enemy pieces next)
      positions.push({
        fen: chess.fen(),
        solutions: enemyPlacement.forkSquares,
        pieceType,
        value: 0, // Will be calculated based on forked pieces
      });
    }

    return positions;
  }

  private placeEnemyPieces(
    chess: Chess,
    attackerSquare: Square,
    shouldHaveFork: boolean
  ): PlacedEnemies {
    // Get all squares the attacker can reach
    const attackedSquares = new Set<Square>();
    const piece = chess.get(attackerSquare);
    if (!piece) throw new Error('Attacker not found');

    // Get squares our piece can attack
    const moves = chess.moves({ square: attackerSquare, verbose: true });
    moves.forEach((move) => attackedSquares.add(move.to as Square));

    // For a fork, we need at least two squares that can be attacked simultaneously
    const result: PlacedEnemies = {
      pieces: new Map(),
      forkSquares: [],
      value: 0,
    };

    if (shouldHaveFork) {
      // Choose 2-3 squares that can be attacked from some common square
      // const numTargets = Math.min(Math.floor(Math.random() * 2) + 2, maxEnemies);
      const numTargets = 2;

      // Find potential fork squares (squares that can attack multiple targets)
      let possibleForkSquares = Array.from(attackedSquares);

      // Shuffle the squares to randomize the selection
      possibleForkSquares = this.shuffleArray(possibleForkSquares);
      for (const s of possibleForkSquares) {
        console.log(`[fork] possible fork square: ${s}`);
      }

      // place an enemy piece on the attacked squares
      for (let i = 0; i < numTargets && i < possibleForkSquares.length; i++) {
        const square = possibleForkSquares[i];
        const enemyPiece = this.chooseRandomEnemyPiece();
        console.log(`[fork] placing ${enemyPiece.type}(${enemyPiece.color}) at ${square}`);
        chess.put(enemyPiece, square);
        result.pieces.set(square, enemyPiece);
        result.forkSquares.push(square);
        result.value += this.getPieceValue(enemyPiece);
      }
    } else {
      // For non-fork positions, place 2-3 pieces that *cannot* be forked
      const numPieces = Math.floor(Math.random() * 2) + 2;
      const placedSquares = new Set<Square>();

      // Place pieces ensuring no fork is possible
      while (placedSquares.size < numPieces) {
        const square = ChessUtils.getRandomCjsSquare();

        // Check if this square would create a fork
        const wouldCreateFork = Array.from(attackedSquares).some((forkSquare) => {
          chess.put(piece, forkSquare);
          const moves = chess
            .moves({ square: forkSquare, verbose: true })
            .map((m) => m.to as Square);
          chess.remove(forkSquare);

          return moves.includes(square) && moves.some((m) => placedSquares.has(m));
        });

        if (!wouldCreateFork && !placedSquares.has(square)) {
          const enemyPiece = this.chooseRandomEnemyPiece();
          chess.put(enemyPiece, square);
          result.pieces.set(square, enemyPiece);
          placedSquares.add(square);
        }
      }
    }

    return result;
  }

  private chooseRandomEnemyPiece(): Piece {
    // Weighted selection favoring more valuable pieces
    const pieces: Array<[PieceSymbol, number]> = [
      ['q', 1], // Less common
      ['p', 1],
      ['r', 2],
      ['b', 3],
      ['n', 3],
    ];
    // remove the current piece type from the list
    pieces.splice(
      pieces.findIndex(([piece]) => piece === this.pieceType.type),
      1
    );

    const totalWeight = pieces.reduce((sum, [_, weight]) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [piece, weight] of pieces) {
      random -= weight;
      if (random <= 0) {
        return { type: piece, color: ChessUtils.oppositeCjsColor(this.pieceType.color) };
      }
    }

    return { type: 'p', color: ChessUtils.oppositeCjsColor(this.pieceType.color) }; // Fallback
  }

  private getPieceValue(piece: Piece): number {
    const values: Record<PieceSymbol, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };
    return values[piece.type];
  }

  private chooseAttackerPosition(pieceType: Piece): Square {
    // For most pieces, central squares are typically better for forks
    // We'll weight the selection towards central squares

    // Define square weights: higher for central squares
    const weights = new Map<Square, number>();
    for (const file of 'abcdefgh') {
      for (const rank of '12345678') {
        const square = (file + rank) as Square;

        // Calculate distance from center (e4/d4/e5/d5)
        const fileDistance = Math.min(
          Math.abs(file.charCodeAt(0) - 'e'.charCodeAt(0)),
          Math.abs(file.charCodeAt(0) - 'd'.charCodeAt(0))
        );
        const rankDistance = Math.min(Math.abs(parseInt(rank) - 4), Math.abs(parseInt(rank) - 5));

        // Weight based on distance from center
        const distanceWeight = 1 / (1 + fileDistance + rankDistance);

        // Adjust weights based on piece type
        let pieceSpecificWeight = 1;
        switch (pieceType.type) {
          case 'n':
            // Knights are most effective in the center
            pieceSpecificWeight = distanceWeight * 2;
            break;
          case 'b':
            // Bishops can be effective anywhere, but slightly prefer center
            pieceSpecificWeight = distanceWeight * 1.5;
            break;
          case 'r':
            // Rooks are equally effective anywhere
            pieceSpecificWeight = 1;
            break;
          case 'q':
            // Queens are slightly more effective in the center
            pieceSpecificWeight = distanceWeight * 1.2;
            break;
          default:
            pieceSpecificWeight = distanceWeight;
        }

        weights.set(square, pieceSpecificWeight);
      }
    }

    // Choose a square based on weights
    const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const [square, weight] of weights) {
      random -= weight;
      if (random <= 0) {
        return square;
      }
    }

    // Fallback (shouldn't reach here)
    return ChessUtils.getRandomCjsSquare();
  }

  public getCurrentPosition(): ForkPosition {
    return this.positions[this.currentPositionIndex];
  }

  public nextPosition(): boolean {
    if (this.currentPositionIndex < this.positions.length - 1) {
      this.currentPositionIndex++;
      return true;
    }
    return false;
  }

  private getRandomValueablePiece(): string {
    // Pieces ordered roughly by value
    const pieces = ['q', 'r', 'b', 'n'];
    return pieces[Math.floor(Math.random() * pieces.length)];
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  protected isCorrect(answer: string[]): boolean {
    const current = this.getCurrentPosition();
    if (!current) return false;

    // All solution squares must be found, no extra squares
    return (
      answer.length === current.solutions.length &&
      answer.every((square) => current.solutions.includes(square))
    );
  }

  protected displayedSkill(answer: string[], timeSpent: number): number {
    if (!this.isCorrect(answer)) return 0;

    // Scale from 1 at t=5s to 0.5 at t=30s
    const timeScore = Math.max(0.5, 1 - (timeSpent - 5000) / 25000);
    return timeScore;
  }
}

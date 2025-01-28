import { Color, Piece, PieceSymbol, Square } from 'chess.js';
import { Color as CGColor } from './chessground/types';

/**

# Chess.js types:

type Piece = {
    color: Color;
    type: PieceSymbol;
}

type Color = "w" | "b"



*/

/**

# Chessground types:

types slightly customized with a vendored version of chessground. This is to
avoid collisions at render time between chessground and vuetify's material-ui
colors.

Modification is to replace `white` and `black` with `cg-white` and `cg-black`.


type Color = "cg-white" | "cg-black"

*/

const pieces: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k'];

export default class ChessUtils {
  static getRandomCjsSquare(): Square {
    const files = 'abcdefgh';
    const ranks = '12345678';
    return (files[Math.floor(Math.random() * 8)] + ranks[Math.floor(Math.random() * 8)]) as Square;
  }

  static getRandomCjsPiece(): Piece {
    const color: Color = Math.random() > 0.5 ? 'w' : 'b';
    return { type: pieces[Math.floor(Math.random() * 6)], color };
  }

  static getRandomCjsColor(): Color {
    return Math.random() > 0.5 ? 'w' : 'b';
  }

  static getRandomCGColor(): CGColor {
    return Math.random() > 0.5 ? 'cg-white' : 'cg-black';
  }

  static oppositeCjsColor(color: Color): Color {
    return color === 'w' ? 'b' : 'w';
  }
  static oppositeCGColor(color: CGColor): CGColor {
    return color === 'cg-white' ? 'cg-black' : 'cg-white';
  }

  static toCjsColor(color: CGColor): Color {
    return color === 'cg-white' ? 'w' : 'b';
  }
  static toCGColor(color: Color): CGColor {
    return color === 'w' ? 'cg-white' : 'cg-black';
  }

  static cjsPieceToString(p: Piece): string {
    const pieceSymbols = {
      w: {
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔',
        p: '♙',
      },
      b: {
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
        p: '♟',
      },
    };

    return `${p.color === 'w' ? 'White' : 'Black'} ${pieceSymbols[p.color][p.type]}`;
  }

  static toMove(fen: string): CGColor {
    // parse fen string for current player
    const colorChar = fen.split(' ')[1];
    return colorChar === 'w' ? 'cg-white' : 'cg-black';
  }
}

<template>
  <div>
    <p class="headline">
      Make the best move for {{ playerColor === 'cg-white' ? 'White ♖♘♗♕♔♗♘♖' : 'Black ♜♞♝♚♛♝♞♜' }}:
    </p>
    <div class="board-wrapper">
      <div class="ranks-labels">
        <div v-for="rank in 8" :key="rank">{{ playerColor === 'cg-white' ? 9 - rank : rank }}</div>
      </div>
      <div class="board-and-files">
        <div id="cg"></div>
        <div class="files-labels">
          <div v-for="file in files" :key="file">{{ file }}</div>
        </div>
      </div>
    </div>
    <div v-if="showPromotionDialog" class="promotion-dialog">
      <button @click="handlePromotion('q')">{{ playerColor === 'cg-white' ? '♕' : '♛' }} Queen</button>
      <button @click="handlePromotion('r')">{{ playerColor === 'cg-white' ? '♖' : '♜' }} Rook</button>
      <button @click="handlePromotion('b')">{{ playerColor === 'cg-white' ? '♗' : '♝' }} Bishop</button>
      <button @click="handlePromotion('n')">{{ playerColor === 'cg-white' ? '♘' : '♞' }} Knight</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Chessground } from '../../chessground/chessground';
import { Key } from '../../chessground/types';
import { Api as cgAPI } from '../../chessground/api';
import { QuestionView } from '@/base-course/Viewable';
import { ChessPuzzle } from './index';
import { Chess, SQUARES } from 'chess.js';

type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface UciMove {
  from: string;
  to: string;
  promotion?: PromotionPiece;
}

function parseUciMove(moveString: string): UciMove {
  if (moveString.length < 4 || moveString.length > 5) {
    throw new Error(`Invalid UCI move format: ${moveString}`);
  }

  return {
    from: moveString.substring(0, 2),
    to: moveString.substring(2, 4),
    promotion: moveString.length === 5 ? (moveString[4] as PromotionPiece) : undefined,
  };
}

@Component({})
export default class PuzzleView extends QuestionView<ChessPuzzle> {
  public answer: string = '';
  private chessEngine: Chess;
  private chessBoard: cgAPI;
  public playerColor: Color = 'cg-white';

  private readonly animDelay: number = 300;

  public showPromotionDialog = false;
  private promotionMove: { from: string; to: string } | null = null;

  get question() {
    return new ChessPuzzle(this.data);
  }

  get files(): string[] {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return this.playerColor === 'cg-white' ? files : files.reverse();
  }

  public mounted() {
    // this.log(`data: ${this.data}`);
    this.chessEngine = new Chess(this.question.fen);
    this.playerColor = swapColor(toColor(this.chessEngine));
    this.log(`Player color: ${this.playerColor}`);

    this.chessBoard = Chessground(document.getElementById('cg')!, {
      movable: {
        free: false,
        showDests: true,
        dests: toDests(this.chessEngine),
      },
      draggable: {
        showGhost: true,
      },
      fen: this.chessEngine.fen(),
      orientation: this.playerColor,
      coordinates: false,
      animation: {
        duration: this.animDelay,
        enabled: true,
      },
    });

    this.chessBoard.set({
      movable: {
        events: {
          // @ts-ignore
          after: this.checkMove,
        },
      },
    });

    const firstMove = this.question.moves.shift()!;

    this.chessBoard.move(firstMove.substring(0, 2) as Key, firstMove.substring(2) as Key);
    this.chessEngine.move({ from: firstMove.substring(0, 2), to: firstMove.substring(2) });
    this.updateChessground();
  }

  private isUnfinishedPromotion(from: string, to: string, promotionPiece?: PromotionPiece): boolean {
    if (this.isPromotionPiece(promotionPiece)) {
      // If promotion piece is provided, it's a finished promotion move
      return false;
    }

    // @ts-ignore
    const piece = this.chessEngine.get(from);
    return piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
  }

  public handlePromotion(promotionPiece: PromotionPiece) {
    if (!this.promotionMove) return;

    this.log(`promoting to ${promotionPiece}`);
    this.showPromotionDialog = false;
    this.checkMove(this.promotionMove.from, this.promotionMove.to, promotionPiece);
  }

  public isPromotionPiece(p: any): p is PromotionPiece {
    return ['q', 'r', 'b', 'n'].includes(p);
  }

  /**
   * Checks the user's move against the expected move.
   *
   * If correct, puzzle advances (or finishes). Else, the move is reverted.
   *
   * @param orig
   * @param dest
   */
  checkMove(orig: any, dest: any, promotionPiece?: PromotionPiece) {
    this.log('checkMove', orig, dest);
    this.log('moves: ' + this.question.moves);
    if (this.question.moves.length === 0) {
      throw new Error('No moves');
    }

    if (this.isUnfinishedPromotion(orig, dest, promotionPiece)) {
      this.promotionMove = { from: orig, to: dest };
      this.showPromotionDialog = true;
      return; // Wait for promotion piece selection
    }

    let expectedMove = this.question.moves[0];
    this.log(`Expected move: ${expectedMove}`);

    const moveMade = this.isPromotionPiece(promotionPiece) ? `${orig}${dest}${promotionPiece}` : `${orig}${dest}`;
    this.log(`Move made: ${moveMade}`);

    if (expectedMove === moveMade) {
      this.log('move is correct');
      this.chessEngine.move({
        from: orig,
        to: dest,
        promotion: this.isPromotionPiece(promotionPiece) ? promotionPiece : undefined,
      });
      this.updateChessground();

      this.question.moves.shift();
      this.log(this.question.moves);

      if (this.question.moves.length === 0) {
        this.log('no more moves - puzzle completed');
        this.submitAnswer('');
      } else {
        window.setTimeout(() => {
          let nextMove = this.question.moves.shift()!;
          this.log('computerMove', nextMove);
          const move = parseUciMove(nextMove);
          this.chessEngine.move(move);
          this.updateChessground();
        }, this.animDelay);
      }
    } else {
      // check for a checkmate
      this.chessEngine.move({ from: orig, to: dest, promotion: promotionPiece });
      if (this.chessEngine.isCheckmate()) {
        this.log('checkmate');
        this.submitAnswer(ChessPuzzle.CHECKMATE);
      } else {
        // revert the move
        this.chessEngine.undo();
      }

      this.log('incorrect - revert the move'); // [ ] visual feedback? emit 'wrongness' event?
      this.submitAnswer(orig + dest + promotionPiece);
      this.updateChessground();
    }
  }

  updateChessground() {
    this.chessBoard.set({
      fen: this.chessEngine.fen(),
      turnColor: toColor(this.chessEngine),
      movable: {
        color: toColor(this.chessEngine),
        dests: toDests(this.chessEngine),
      },
    });
  }
}

function toDests(chess: Chess) {
  const dests = new Map();
  SQUARES.forEach(s => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map(m => m.to)
      );
  });
  // console.log(dests);
  return dests;
}

type Color = 'cg-white' | 'cg-black';

function swapColor(color: Color): Color {
  console.log('swapColor', color);
  return color === 'cg-white' ? 'cg-black' : 'cg-white';
}

function toColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'cg-white' : 'cg-black';
}

function playOtherSide(cg: cgAPI, chess: Chess) {
  return (orig: any, dest: any) => {
    chess.move({ from: orig, to: dest });
    cg.set({
      turnColor: toColor(chess),
      movable: {
        color: toColor(chess),
        dests: toDests(chess),
      },
    });
  };
}
</script>

<style scoped>
@import '../../chessground/css/chessground.base.css';
@import '../../chessground/css/chessground.brown.css';
@import '../../chessground/css/chessground.cburnett.css';

.promotion-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promotion-dialog button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 150px;
}

.promotion-dialog button:hover {
  background: #e0e0e0;
}

/* Optional: Add piece symbols next to text */
.promotion-dialog button::before {
  content: attr(data-piece);
  font-size: 24px;
}

.board-wrapper {
  display: flex;
  align-items: center;
  width: 440px;
}

.ranks-labels {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* width: 0px; */
  height: 400px;
  margin-right: 10px;
}

.ranks-labels.reversed {
  flex-direction: column-reverse;
}

.ranks-labels div {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-and-files {
  display: flex;
  flex-direction: column;
}

.files-labels {
  display: flex;
  justify-content: center;
  height: 20px;
}

.files-labels.reversed {
  flex-direction: row-reverse;
}

.files-labels div {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#cg {
  width: 400px;
  height: 400px;
}
</style>

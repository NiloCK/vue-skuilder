<template>
  <div>
    <p class="headline">Make the best move for {{ playerColor === 'cg-white' ? '♖ White ♖' : '♜ Black ♜' }}:</p>
    <div class="board-wrapper">
      <div class="ranks-labels" :class="{ reversed: playerColor === 'cg-black' }">
        <div v-for="rank in 8" :key="rank">{{ playerColor === 'cg-white' ? 9 - rank : rank }}</div>
      </div>
      <div class="board-and-files">
        <div id="cg"></div>
        <div class="files-labels" :class="{ reversed: playerColor === 'cg-black' }">
          <div v-for="file in files" :key="file">{{ file }}</div>
        </div>
      </div>
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

@Component({})
export default class PuzzleView extends QuestionView<ChessPuzzle> {
  public answer: string = '';
  private chessEngine: Chess;
  private chessBoard: cgAPI;
  private playerColor: Color;

  private readonly animDelay: number = 300;

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
          after: this.checkMove,
        },
      },
    });

    const firstMove = this.question.moves.shift()!;

    this.chessBoard.move(firstMove.substring(0, 2) as Key, firstMove.substring(2) as Key);
    this.chessEngine.move({ from: firstMove.substring(0, 2), to: firstMove.substring(2) });
    this.updateChessground();
  }

  /**
   * Checks the user's move against the expected move.
   *
   * If correct, puzzle advances (or finishes). Else, the move is reverted.
   *
   * @param orig
   * @param dest
   */
  checkMove(orig: any, dest: any) {
    this.log('checkMove', orig, dest);
    this.log('moves: ' + this.question.moves);
    if (this.question.moves.length === 0) {
      throw new Error('No moves');
    }

    let expectedMove = this.question.moves[0];
    this.log(`Expected move: ${expectedMove}`);

    if (expectedMove === orig + dest) {
      this.log('move is correct');
      this.chessEngine.move({ from: orig, to: dest });
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
          this.chessEngine.move({
            from: nextMove.substring(0, 2),
            to: nextMove.substring(2),
          });
          this.updateChessground();
        }, this.animDelay);
      }
    } else {
      // check for a checkmate
      this.chessEngine.move({ from: orig, to: dest });
      if (this.chessEngine.isCheckmate()) {
        this.log('checkmate');
        this.submitAnswer(ChessPuzzle.CHECKMATE);
      } else {
        // revert the move
        this.chessEngine.undo();
      }

      this.log('incorrect - revert the move'); // [ ] visual feedback? emit 'wrongness' event?
      this.submitAnswer(orig + dest);
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

<template>
  <div>
    <div id="cg"></div>
    <!-- {{ question.fen }} -->
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Chessground } from '../../chessground/chessground';
import { Key } from '../../chessground/types';
import { Api as cgAPI } from '../../chessground/api';
import { QuestionView } from '@/base-course/Viewable';
import { Puzzle } from './index';
import { Chess, SQUARES } from 'chess.js';

@Component({})
export default class PuzzleView extends QuestionView<Puzzle> {
  public answer: string = '';
  private chess: Chess;
  private cg: cgAPI;
  private playerColor: Color;
  private moveSequence: string[] = [];

  get question() {
    return new Puzzle(this.data);
  }

  public mounted() {
    this.chess = new Chess(this.question.fen);
    this.playerColor = swapColor(toColor(this.chess));
    this.moveSequence = this.question.moves;

    this.cg = Chessground(document.getElementById('cg')!, {
      movable: {
        free: false,
        showDests: true,
        dests: toDests(this.chess),
      },
      draggable: {
        showGhost: true,
      },
      fen: this.chess.fen(),
      orientation: this.playerColor,
      coordinates: false,
      animation: {
        duration: 300,
        enabled: true,
      },
    });

    this.cg.set({
      movable: {
        events: {
          after: this.checkMove,
        },
      },
    });

    const firstMove = this.moveSequence.shift()!;

    this.cg.move(firstMove.substring(0, 2) as Key, firstMove.substring(2) as Key);
    this.chess.move({ from: firstMove.substring(0, 2), to: firstMove.substring(2) });
    this.updateChessground();
  }

  checkMove(orig: any, dest: any) {
    this.log('checkMove', orig, dest);
    let puzzleMoves = this.question.moves;
    this.log('moves: ' + puzzleMoves);
    if (puzzleMoves.length === 0) {
      throw new Error('No moves');
    }

    let expectedMove = puzzleMoves[0];
    this.log(`Expected move: ${expectedMove}`);

    if (expectedMove === orig + dest) {
      this.log('correct');
      this.chess.move({ from: orig, to: dest });
      this.updateChessground();

      this.question.moves.shift();
      this.log(this.question.moves);

      if (this.question.moves.length === 0) {
        // alert('done - you have solved the puzzle.');
        this.submitAnswer('');
      } else {
        let nextMove = this.question.moves.shift()!;
        this.log('computerMove', nextMove);
        this.chess.move({
          from: nextMove.substring(0, 2),
          to: nextMove.substring(2),
        });
        this.updateChessground();
      }
    } else {
      alert('incorrect - revert the move'); // [ ] visual feedback? emit 'wrongness' event?
      this.updateChessground();
    }

    return true;
  }

  updateChessground() {
    this.cg.set({
      fen: this.chess.fen(),
      turnColor: toColor(this.chess),
      movable: {
        color: toColor(this.chess),
        dests: toDests(this.chess),
      },
    });
  }

  // public submit() {
  //   alert(this.question.isCorrect(parseInt(this.answer, 10)));
  // }
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
#cg {
  width: 400px;
  height: 400px;
}
</style>

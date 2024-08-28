<template>
  <div >
    <div id="cg"></div>
    {{ question.fen }}   
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Chessground } from '../../chessground/chessground';
import { Api as cgAPI } from '../../chessground/api';
import { QuestionView } from '@/base-course/Viewable';
import { Puzzle } from './index';
import { Chess, SQUARES } from 'chess.js';

@Component({
  components: {
    // cb,
  },
})
export default class PuzzleView extends QuestionView<Puzzle> {
  public answer: string = '';
  get question() {
    return new Puzzle(this.data);
  }

  public mounted() {
    let chess = new Chess();

    // this.$nextTick(() => {
    const cg = Chessground(document.getElementById('cg')!, {
      movable: {
        free: false,
        color: 'both',
        showDests: true,
        dests: toDests(chess),
      },
      draggable: {
        showGhost: true,
      },
      // fen: this.question.fen,
    });

    cg.set({
      movable: {
        events: {
          after: playOtherSide(cg, chess),
        },
      },
    });
    // });
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}

function toDests(chess: Chess) {
  const dests = new Map();
  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to)
      );
  });
  console.log(dests);
  return dests;
}

function toColor(chess: Chess) {
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
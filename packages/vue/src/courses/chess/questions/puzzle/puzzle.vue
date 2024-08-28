<template>
  <div width="500px">
    <!-- <chessboard :fen="question.fen" />
    <div id="chessground" width="500px"></div> -->
    <div id="cg"></div>
    {{ question.fen }}
    <!-- <input type="number" v-model="answer" @keyup.enter="submitAnswer(answer)" /> -->
    <!-- <UserInputNumber /> -->
    <div id="cbjs" style="width: 500px"></div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
// import { chessboard } from 'vue-chessboard';
// import { Chessground } from 'chessground';
// import ChessBoard from 'chessboardjs-vue';
import { QuestionView } from '@/base-course/Viewable';
import { Puzzle } from './index';
// @ts-ignore
import cb from 'chessboardjs-vue';
import Chess from 'chess.js';

// console.log(c.WHITE);

let chess = new Chess.Chess();
function onDrop(source: any, target: any) {
  // see if the move is legal
  var move = chess.move({
    from: source,
    to: target,
    promotion: 'q', // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  // updateStatus();
}

@Component({
  components: {
    cb,
  },
})
export default class PuzzleView extends QuestionView<Puzzle> {
  public answer: string = '';
  get question() {
    return new Puzzle(this.data);
  }

  // somefen: rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2

  public mounted() {
    // const cg = Chessground(document.getElementById('chessground')!, {
    //   fen: this.question.fen,
    // });
    // const cg = Chessground(document.getElementById('cg')!, {
    //   fen: this.question.fen,
    // });
    const cbjs = cb('cbjs', {
      draggable: true,
      position: this.question.fen,
      // onDrop,
    });
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>


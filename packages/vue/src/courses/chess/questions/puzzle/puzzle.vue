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
import { defineComponent, onMounted, computed, ref } from 'vue';
import { Chessground } from '../../chessground/chessground';
import { Key } from '../../chessground/types';
import { Api as cgAPI } from '../../chessground/api';
import { QuestionView } from '@/base-course/Viewable';
import { ChessPuzzle } from './index';
import { Chess, SQUARES } from 'chess.js';
import { SkldrComposable } from '@/mixins/SkldrComposable';

type Color = 'cg-white' | 'cg-black';
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

export default defineComponent({
  name: 'PuzzleView',
  
  props: {
    data: {
      type: Object,
      required: true
    }
  },

  setup(props, { emit }) {
    const { log } = SkldrComposable();
    const answer = ref('');
    const chessEngine = ref<Chess>();
    const chessBoard = ref<cgAPI>();
    const playerColor = ref<Color>('cg-white');
    const showPromotionDialog = ref(false);
    const promotionMove = ref<{ from: string; to: string } | null>(null);
    const animDelay = 300;

    const question = computed(() => new ChessPuzzle(props.data));

    const files = computed(() => {
      const filesList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      return playerColor.value === 'cg-white' ? filesList : filesList.reverse();
    });

    function isPromotionPiece(p: any): p is PromotionPiece {
      return ['q', 'r', 'b', 'n'].includes(p);
    }

    function isUnfinishedPromotion(from: string, to: string, promotionPiece?: PromotionPiece): boolean {
      if (isPromotionPiece(promotionPiece)) {
        return false;
      }
      const piece = chessEngine.value?.get(from);
      return piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
    }

    function updateChessground() {
      if (!chessBoard.value || !chessEngine.value) return;
      
      chessBoard.value.set({
        fen: chessEngine.value.fen(),
        turnColor: toColor(chessEngine.value),
        movable: {
          color: toColor(chessEngine.value),
          dests: toDests(chessEngine.value),
        },
      });
    }

    function handlePromotion(promotionPiece: PromotionPiece) {
      if (!promotionMove.value) return;

      log(`promoting to ${promotionPiece}`);
      showPromotionDialog.value = false;
      checkMove(promotionMove.value.from, promotionMove.value.to, promotionPiece);
    }

    function checkMove(orig: any, dest: any, promotionPiece?: PromotionPiece) {
      if (!chessEngine.value || !question.value.moves.length) return;

      if (isUnfinishedPromotion(orig, dest, promotionPiece)) {
        promotionMove.value = { from: orig, to: dest };
        showPromotionDialog.value = true;
        return;
      }

      const expectedMove = question.value.moves[0];
      const moveMade = isPromotionPiece(promotionPiece) ? `${orig}${dest}${promotionPiece}` : `${orig}${dest}`;

      if (expectedMove === moveMade) {
        chessEngine.value.move({
          from: orig,
          to: dest,
          promotion: isPromotionPiece(promotionPiece) ? promotionPiece : undefined,
        });
        updateChessground();

        question.value.moves.shift();

        if (question.value.moves.length === 0) {
          emit('submit-answer', '');
        } else {
          window.setTimeout(() => {
            if (!chessEngine.value) return;
            const nextMove = question.value.moves.shift()!;
            const move = parseUciMove(nextMove);
            chessEngine.value.move(move);
            updateChessground();
          }, animDelay);
        }
      } else {
        chessEngine.value.move({ from: orig, to: dest, promotion: promotionPiece });
        if (chessEngine.value.isCheckmate()) {
          emit('submit-answer', ChessPuzzle.CHECKMATE);
        } else {
          chessEngine.value.undo();
        }
        emit('submit-answer', orig + dest + promotionPiece);
        updateChessground();
      }
    }

    onMounted(() => {
      chessEngine.value = new Chess(question.value.fen);
      playerColor.value = swapColor(toColor(chessEngine.value));

      const cgElement = document.getElementById('cg');
      if (!cgElement) return;

      chessBoard.value = Chessground(cgElement, {
        movable: {
          free: false,
          showDests: true,
          dests: toDests(chessEngine.value),
        },
        draggable: {
          showGhost: true,
        },
        fen: chessEngine.value.fen(),
        orientation: playerColor.value,
        coordinates: false,
        animation: {
          duration: animDelay,
          enabled: true,
        },
      });

      chessBoard.value.set({
        movable: {
          events: {
            after: checkMove,
          },
        },
      });

      const firstMove = question.value.moves.shift()!;
      chessBoard.value.move(firstMove.substring(0, 2) as Key, firstMove.substring(2) as Key);
      chessEngine.value.move({ from: firstMove.substring(0, 2), to: firstMove.substring(2) });
      updateChessground();
    });

    return {
      answer,
      playerColor,
      showPromotionDialog,
      files,
      handlePromotion,
    };
  },
});

// Helper functions
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
  return dests;
}

function swapColor(color: Color): Color {
  return color === 'cg-white' ? 'cg-black' : 'cg-white';
}

function toColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'cg-white' : 'cg-black';
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

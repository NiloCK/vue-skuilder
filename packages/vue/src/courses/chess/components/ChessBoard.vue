<!-- src/courses/chess/components/base/ChessBoard.vue -->
<template>
  <div class="chess-board-container">
    <div v-if="showCoordinates" class="ranks-labels">
      <!-- rank labels -->
    </div>
    <div class="board-and-files">
      <div ref="boardElement" class="board"></div>
      <div v-if="showCoordinates" class="files-labels">
        <!-- file labels -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chessground } from '../chessground/chessground';
import { Config } from '../chessground/config';
import type { Api as CgAPI } from '../chessground/api';
import type { ChessPosition, Move } from './types';
import { Key, Piece as cgPiece } from '../chessground/types';
import { Piece as cjsPiece } from 'chess.js';
import ChessUtils from '../chessUtils';

export interface AnimationMove {
  from: Key;
  to: Key;
  /**
   * Optional piece - not necessary to provide
   * if the piece is already expected at the `from` square.
   */
  piece?: cgPiece | cjsPiece;
  duration?: number;
}

interface ChessBoardExpose {
  playAnimation: (moves: AnimationMove[]) => Promise<void> | void;
}

defineExpose<ChessBoardExpose>({
  playAnimation: async (moves: AnimationMove[], duration: number = 500) => {
    if (!board.value) return;
    if (animating.value) return;

    animating.value = true;
    const originalFen = props.position.fen;

    for (const move of moves) {
      // Handle piece placement if specified
      if (move.piece) {
        board.value.setPieces(new Map([[move.to, ChessUtils.asCgPiece(move.piece)]]));
        await new Promise((resolve) => setTimeout(resolve, duration / 2));
      }
      // Handle the move
      board.value.move(move.from, move.to);
      await new Promise((resolve) => setTimeout(resolve, duration));
    }

    // Reset to original position
    setTimeout(() => {
      board.value?.set({ fen: originalFen });
    }, duration);
  },
});

const props = defineProps<{
  position: ChessPosition;
  config?: Config;
  showCoordinates?: boolean;
  animations?: AnimationMove[];
}>();

const emit = defineEmits<{
  move: [move: Move];
  'position-change': [position: ChessPosition];
}>();

const boardElement = ref<HTMLElement>();
const board = ref<CgAPI>();
const animating = ref(false);

// Setup and cleanup
onMounted(() => {
  if (!boardElement.value) return;
  board.value = Chessground(boardElement.value, {
    ...props.config,
    fen: props.position.fen,
    orientation: props.position.orientation || 'cg-white',
    movable: {
      events: {
        after: (orig, dest) => {
          emit('move', { from: orig, to: dest });
        },
      },
      ...props.config?.movable,
    },
  });
});

onUnmounted(() => {
  board.value?.destroy();
});

// Watch for position changes
watch(
  () => props.position,
  (newPos) => {
    board.value?.set({ fen: newPos.fen });
  },
  { deep: true }
);
watch(
  () => props.config,
  (newConfig) => {
    console.log('[ChessBoard] Config changed:', newConfig);
    if (board.value) {
      board.value.set(newConfig);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.chess-board-container {
  position: relative;
  width: 100%;
}

.board-and-files {
  position: relative;
  width: 100%;
  /* Create a square aspect ratio */
  padding-bottom: 100%;
}

.board {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

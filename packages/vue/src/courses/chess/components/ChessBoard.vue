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
import type { Api as CgAPI } from '../chessground/api';
import type { ChessPosition, BoardConfig, Move } from './types';

const props = defineProps<{
  position: ChessPosition;
  config?: BoardConfig;
  showCoordinates?: boolean;
}>();

const emit = defineEmits<{
  move: [move: Move];
  'position-change': [position: ChessPosition];
}>();

const boardElement = ref<HTMLElement>();
const board = ref<CgAPI>();

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
</script>

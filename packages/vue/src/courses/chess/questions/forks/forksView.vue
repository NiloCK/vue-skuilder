<template>
  <div data-viewable="ForksView">
    <p class="text-h5">Find all squares where a ___ can fork the enemy pieces:</p>

    <div class="forks-board-container">
      <ChessBoard :position="boardPosition" :config="boardConfig" @square-click="handleSquareClick" />
    </div>

    <div class="selected-squares">Selected squares: {{ selectedSquares.join(', ') }}</div>

    <v-btn @click="submitAnswer">Submit</v-btn>
    <v-btn @click="clearSelection">Clear Selection</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useViewable, useQuestionView } from '@/base-course/CompositionViewable';
import ChessBoard from '../../components/ChessBoard.vue';
import { ForkFinder } from './index';
import type { ChessPosition, BoardConfig } from '../../components/types';
import type { ViewData } from '@/base-course/Interfaces/ViewData';
import ChessUtils from '../../chessUtils';

const props = defineProps<{
  data: ViewData[];
  modifyDifficulty?: number;
}>();

const emit = defineEmits(['emitResponse']);

const viewableUtils = useViewable(props, emit, 'ForksView');
const questionUtils = useQuestionView<ForkFinder>(viewableUtils);

const selectedSquares = ref<string[]>([]);

// Initialize question
questionUtils.question.value = new ForkFinder(props.data);

const currentPosition = computed(() => {
  return questionUtils.question.value?.getCurrentPosition();
});

const boardPosition = computed<ChessPosition>(() => {
  const fen = currentPosition.value?.fen || '8/8/8/8/8/8/8/8 w - - 0 1';
  const orientation = ChessUtils.toMove(fen);

  return {
    fen,
    orientation,
  };
});

const boardConfig: BoardConfig = {
  viewOnly: false,
  movable: {
    free: true,
    color: 'both',
    showDests: false,
  },
  coordinates: true,
};

const handleSquareClick = (square: string) => {
  const index = selectedSquares.value.indexOf(square);
  if (index === -1) {
    selectedSquares.value.push(square);
  } else {
    selectedSquares.value.splice(index, 1);
  }
};

const submitAnswer = () => {
  questionUtils.submitAnswer(selectedSquares.value);
  if (questionUtils.question.value?.nextPosition()) {
    selectedSquares.value = [];
  }
};

const clearSelection = () => {
  selectedSquares.value = [];
};
</script>

<style scoped>
.forks-board-container {
  width: 400px;
  margin: 20px auto;
}

.selected-squares {
  margin: 20px 0;
  font-size: 1.1em;
}
</style>

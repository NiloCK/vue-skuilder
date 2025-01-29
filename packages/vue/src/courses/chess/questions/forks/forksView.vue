<template>
  <div data-viewable="ForksView">
    <!-- <img :src="CheckMarkRaw" alt="" /> -->
    <p class="text-h5">Find safe forking squares for the</p>
    <p class="text-h3">{{ pieceImg }}</p>

    <div class="forks-board-container">
      <ChessBoard :position="boardPosition" :config="boardConfig" />
    </div>

    <div class="selected-squares">Selected squares: {{ selectedSquares.join(', ') }}</div>

    <v-btn color="primary" @click="submitAnswer">All Done</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useViewable, useQuestionView } from '@/base-course/CompositionViewable';
import ChessBoard from '../../components/ChessBoard.vue';
import { ForkFinder } from './index';
import type { ChessPosition } from '../../components/types';
import type { ViewData } from '@/base-course/Interfaces/ViewData';
import ChessUtils from '../../chessUtils';
import { Config } from '../../chessground/config';
import { DrawShape } from '../../chessground/draw';
import checkmark from '../../assets/checkmark.svg?raw';
import xmark from '../../assets/x-mark.svg?raw';
import { Key } from '../../chessground/types';

console.log(`[forksView] checkmark: ${checkmark}`);

const wrapSvg = (svg: string) => `
  <g transform="translate(2 2) scale(0.3)">
    ${svg}
  </g>
`;

const props = defineProps<{
  data: ViewData[];
  modifyDifficulty?: number;
}>();

const emit = defineEmits(['emitResponse']);

const viewableUtils = useViewable(props, emit, 'ForksView');
const questionUtils = useQuestionView<ForkFinder>(viewableUtils);

const selectedSquares = ref<Key[]>([]);

// Initialize question
questionUtils.question.value = new ForkFinder(props.data);

const playerPiece = computed(() => {
  return questionUtils.question.value?.playerPiece();
});

const pieceImg = computed(() => {
  if (playerPiece.value) {
    return ChessUtils.cjsPieceToString(playerPiece.value);
  } else {
    return '';
  }
});

const currentPosition = computed(() => {
  return questionUtils.question.value?.getCurrentPosition();
});

const boardPosition = computed<ChessPosition>(() => {
  const fen = currentPosition.value?.fen || '8/8/8/8/8/8/8/8 w - - 0 1';
  console.log(`[forksView] Position: ${fen}`);
  const orientation = ChessUtils.toMove(fen);

  return {
    fen,
    orientation,
  };
});

const shapes = computed<DrawShape[]>(() => {
  const ret: DrawShape[] = [];
  selectedSquares.value.forEach((ss) => {
    ret.push({
      orig: ss,
      customSvg: {
        html: currentPosition.value?.solutions.includes(ss) ? checkmark : xmark,
      },
    });
  });
  return ret;
});

const boardConfig = computed<Config>(() => {
  return {
    viewOnly: false,
    movable: {
      free: true,
      color: 'both',
      showDests: false,
    },
    drawable: {
      enabled: true,
      shapes: shapes.value,
    },
    coordinates: false,
    events: {
      select: (square: Key) => handleSquareClick(square),
    },
  };
});

const handleSquareClick = (square: Key) => {
  // [ ] animate square w/
  //   - capturing both enemy pieces if square is safe & correct
  //   - getting captured by an eneym if square unsafe
  //   - failing to capture if square is safe but not a fork ((how to show? - place piece and show available moves?))

  // [ ] communicate w/ quesetionType for correct/incorrect handling

  console.log(`[forksView] clicked ${square}`);
  const index = selectedSquares.value.indexOf(square);
  if (index === -1) {
    selectedSquares.value = [...selectedSquares.value, square];
  } else {
    selectedSquares.value = selectedSquares.value.filter((s) => s !== square);
  }
};

const submitAnswer = () => {
  questionUtils.submitAnswer(selectedSquares.value);
  if (questionUtils.question.value?.nextPosition()) {
    selectedSquares.value = [];
  }
};

watch(
  () => shapes.value,
  (newShapes) => {
    console.log('shapes changed:', newShapes);
  }
);

watch(
  () => boardConfig.value,
  (newConfig) => {
    console.log('boardConfig changed:', newConfig);
  }
);
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

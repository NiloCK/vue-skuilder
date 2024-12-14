<template>
  <div class="mock-environment">
    <div class="component">
      <h2>Falling Letters Game</h2>
      <FallingLettersView
        :course-id="mockCourseId"
        :card-id="mockCardId"
        :modifyDifficulty="0"
        :data="[
          {
            gameLength: 30,
            initialSpeed: 0.5,
            acceleration: 0,
            spawnInterval: 1,
          },
        ]"
      />
    </div>

    <div class="component">
      <h2>Letter Question</h2>
      <LetterQuestionView
        :course-id="mockCourseId"
        :card-id="mockCardId"
        :modifyDifficulty="0"
        :data="[{ letter: 'A' }]"
      />
    </div>

    <div class="component">
      <h2>Chess Piecemove</h2>
      <!-- <PieceMove :course-id="mockCourseId" :card-id="mockCardId" :modifyDifficulty="0" :data="[{ puzzleData: examplePuzzleString
      }]" /> -->
    </div>

    <div class="component">
      <h2>Chess PuzzleView</h2>
      <PuzzleView
        :course-id="mockCourseId"
        :card-id="mockCardId"
        :modifyDifficulty="0"
        :data="[{ puzzleData: Math.random() > 0.5 ? puzzleBlack : puzzleWhite }]"
      />
    </div>
    <!-- <div class="component">
      <h2>Heatmap</h2>
      <HeatMap :data="{}" />
    </div> -->

    <!-- <div class="component">
      <h2>DataInputForm</h2>
      <data-input-form :courseCfg="{}" :dataShape="ChessPuzzleDataShapes[0]" />
    </div> -->

    <!-- <div class="component">
      <h2>DataInputForm</h2>
      <data-input-form :courseCfg="{}" :dataShape="BlanksCardDataShapes[0]" />
    </div> -->

    <div class="component">
      <h2>MediaUploader</h2>
      <media-uploader
        :autofocus="false"
        :uiValidationFunction="() => true"
        :store="{}"
        :field="{
          name: 'MediaUploader',
          type: 'media-uploader',
          validator: {
            test: () => true,
            status: 'success',
          },
        }"
      />
    </div>

    <div class="component">
      <h2>ImageInput</h2>
      <image-input
        :autofocus="false"
        :uiValidationFunction="() => true"
        :field="{
          name: 'Image',
          type: 'image',
          validator: {
            test: () => true,
            status: 'success',
          },
        }"
        :store="{}"
      />
    </div>

    <div class="component">
      <h2>SkTagsInput</h2>
      <sk-tags-input :courseID="mockCourseId" :cardID="mockCardId" :hide-submit="false" />
    </div>
  </div>
</template>

<script lang="ts">
import SkTagsInput from '@/components/Edit/TagsInput.vue';
import ImageInput from '@/components/Edit/ViewableDataInputForm/FieldInputs/ImageInput.vue';
import MediaUploader from '@/components/Edit/ViewableDataInputForm/FieldInputs/MediaUploader.vue';
import HeatMap from '@/components/HeatMap.vue';
import PuzzleView from '@/courses/chess/questions/puzzle/puzzle.vue';
import ChessPieceMove from '@/courses/chess/questions/piecemove/piece-move.vue';
import FillInView from '@/courses/default/questions/fillIn/fillIn.vue';
import { BlanksCardDataShapes } from '@/courses/default/questions/fillIn/index';
import { ChessPuzzle } from '@/courses/chess/questions/puzzle/index';
import SkldrVue from '@/SkldrVue';
import { Component } from 'vue-property-decorator';
import DataInputForm from '../components/Edit/ViewableDataInputForm/DataInputForm.vue';
import LetterQuestionView from '@/courses/typing/questions/single-letter/typeSingleLetter.vue';
import FallingLettersView from '@/courses/typing/questions/falling-letters/FallingLetters.vue';

@Component({
  components: {
    SkTagsInput,
    DataInputForm,
    MediaUploader,
    ImageInput,
    HeatMap,
    PuzzleView,
    LetterQuestionView,
    FallingLettersView,
  },
})
export default class SkTagsInputMock extends SkldrVue {
  mockCourseId: string = 'mock-course-001';
  mockCardId: string = 'mock-card-001';

  // validFenString: string = 'q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17';
  // examplePuzzleString =
  //   '00sJ9,r3r1k1/p4ppp/2p2n2/1p6/3P1qb1/2NQR3/PPB2PP1/R1B3K1 w - - 5 18,e3g3 e8e1 g1h2 e1c1 a1c1 f4h6 h2g1 h6c1,2671,105,87,325,advantage attraction fork middlegame sacrifice veryLong,https://lichess.org/gyFeQsOE#35,French_Defense French_Defense_Exchange_Variation';
  puzzleWhite =
    '00sJb,Q1b2r1k/p2np2p/5bp1/q7/5P2/4B3/PPP3PP/2KR1B1R w - - 1 17,d1d7 a5e1 d7d1 e1e3 c1b1 e3b6,2235,76,97,64,advantage fork long,https://lichess.org/kiuvTFoE#33,Sicilian_Defense Sicilian_Defense_Dragon_Variation';
  puzzleBlack =
    'v2n1N,5Q1k/2pbq1p1/8/pp1P4/4B1P1/7P/PP6/1K3R2 b - - 4 34,e7f8 f1f8,615,86,73,189,endgame mate mateIn1 oneMove,https://lichess.org/Czh6F7z3/black#68,';

  BlanksCardDataShapes = BlanksCardDataShapes;
  ChessPuzzleDataShapes = ChessPuzzle.dataShapes;
  FillInView = FillInView;

  created() {
    return (this.$store.state.dataInputForm.shapeViews = [FillInView]);
  }
}
</script>

<style scoped>
.mock-environment {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.component {
  margin-bottom: 40px;
  border: #333;
  border-width: 3px;
  padding: 20px;
  background-color: #efeff4;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
h2 {
  margin-bottom: 25px;
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  text-decoration: underline;
}
</style>

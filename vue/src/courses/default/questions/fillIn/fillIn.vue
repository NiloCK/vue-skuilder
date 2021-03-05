<template>
  <div ref="fillIn">
    <markdown-renderer :md="question.mdText" />

    <radio-multiple-choice v-if="question.options" :choiceList="question.options" :MouseTrap="MouseTrap" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { BlanksCard, FillInSection } from './index';
import FillInInput from './fillInInput.vue';
import FillInText from './fillInText.vue';
import MarkdownRenderer from '@/base-course/Components/MarkdownRenderer.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import { log } from 'util';
import { type } from 'os';

const typeMap: {
  [index: string]: string;
} = {
  text: 'textType',
  blank: 'blankType',
};

@Component({
  components: {
    MarkdownRenderer,
    RadioMultipleChoice,
    blankType: FillInInput,
    textType: FillInText,
  },
})
export default class FillInView extends QuestionView<BlanksCard> {
  get question() {
    return new BlanksCard(this.data);
  }

  public $refs: {
    canvas: HTMLCanvasElement;
    fillIn: HTMLDivElement;
  };
  private angle: number;
  private _question: BlanksCard;

  private created() {
    this._question = new BlanksCard(this.data);
  }
}
</script>

<style lang="css" scoped>
canvas {
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
}
</style>

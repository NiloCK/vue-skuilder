<template>
  <div>
    <markdown-renderer :md="question.mdText" />
    <radio-multiple-choice v-if="question.options" :choiceList="question.options" :MouseTrap="MouseTrap" />
    <v-card-actions v-else-if="!isQuestion">
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitAnswer('')" :autofocus="autofocus"> Next </v-btn>
    </v-card-actions>
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

  get isQuestion(): boolean {
    if (!this.question.answers || this.question.answers.length === 0) {
      return false;
    } else {
      return true;
    }
  }

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

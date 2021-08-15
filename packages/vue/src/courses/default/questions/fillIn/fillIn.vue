<template>
  <div>
    <audio-auto-player v-if="hasAudio" v-bind:src="audioURL" />
    <markdown-renderer v-bind:md="question.mdText" />
    <radio-multiple-choice v-if="question.options" v-bind:choiceList="question.options" v-bind:MouseTrap="MouseTrap" />
    <v-card-actions v-else-if="!isQuestion">
      <v-spacer></v-spacer>
      <v-btn color="primary" v-on:click="submitAnswer('')" autofocus="autofocus"> Next </v-btn>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';
import MarkdownRenderer from '@/base-course/Components/MarkdownRenderer.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import { QuestionView } from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import FillInInput from './fillInInput.vue';
import FillInText from './fillInText.vue';
import { BlanksCard } from './index';

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
    AudioAutoPlayer,
  },
})
export default class FillInView extends QuestionView<BlanksCard> {
  get question() {
    return new BlanksCard(this.data);
  }
  get hasAudio() {
    if (this.data[0]['audio-1']) {
      return true;
    } else {
      return false;
    }
  }
  get audioURL(): string[] {
    if (this.hasAudio) {
      // let url = URL.createObjectURL(this.data[0].autoplayAudio);
      let urls: string[] = [];
      let i = 1;
      while (this.data[0][`audio-${i}`]) {
        urls.push(URL.createObjectURL(this.data[0][`audio-${i}`]));
        i++;
      }
      return urls;
    } else {
      return [''];
    }
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

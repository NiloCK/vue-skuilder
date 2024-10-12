<template>
  <div>
    <audio-auto-player v-if="hasAudio" v-bind:src="audioURL" />
    <img v-if="hasImage" v-bind:src="imageURL" />
    <markdown-renderer v-bind:md="question.mdText" />
    <radio-multiple-choice v-if="question.options" v-bind:choiceList="truncatedOptions" v-bind:MouseTrap="MouseTrap" />
    <center v-else-if="priorAttempts == 1" class="title">
      <span>
        {{ obscuredAnswer }}
      </span>
    </center>
    <center v-else-if="priorAttempts == 2" class="title">
      <span>
        {{ someAnswer }}
      </span>
    </center>
    <v-card-actions v-if="!isQuestion">
      <v-spacer></v-spacer>
      <v-btn color="primary" v-on:click="submitAnswer('')" autofocus="autofocus"> Next </v-btn>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import { QuestionView } from '@/base-course/Viewable';
import _ from 'lodash';
import { Component } from 'vue-property-decorator';
import FillInInput from './fillInInput.vue';
import FillInText from './fillInText.vue';
import { BlanksCard } from './index';
import gradeSpellingAttempt from './blanksCorrection';

const typeMap: {
  [index: string]: string;
} = {
  text: 'textType',
  blank: 'blankType',
};

@Component({
  components: {
    MarkdownRenderer: () => import('@/base-course/Components/MarkdownRenderer.vue'), // fix against "unknown custom element" bug (?).
    RadioMultipleChoice,
    blankType: FillInInput,
    textType: FillInText,
    AudioAutoPlayer,
  },
})
export default class FillInView extends QuestionView<BlanksCard> {
  public toString() {
    return this.data[0].Input as string;
  }
  get question() {
    return new BlanksCard(this.data);
  }
  get hasImage() {
    if (this.data[0]['image-1']) {
      return true;
    } else {
      return false;
    }
  }

  get imageURL(): string[] {
    if (this.hasImage) {
      let urls: string[] = [];
      let i = 1;
      while (this.data[0][`image-${i}`]) {
        urls.push(URL.createObjectURL(this.data[0][`image-${i}`]));
        i++;
      }
      return urls;
    } else {
      return [''];
    }
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

  /**
   * returns an 'obscured' string hinting at the answer:
   * ie, if the answer is 'Canada', it returns '_ _ _ _ _ _'
   */
  get obscuredAnswer(): string | undefined {
    const sa = this.someAnswer;

    this.log(`Prior answers: ${this.priorAnswers}`);

    if (sa && this.priorAnswers[0][0] && this.priorAnswers[0][1] === 'UserInputString') {
      return gradeSpellingAttempt(sa, this.priorAnswers[0][0] as string);
    }

    if (this.someAnswer) {
      let obscuredAnswer = '';
      for (let i = 0; i < this.someAnswer.length; i++) {
        obscuredAnswer += '_ ';
      }
      return obscuredAnswer;
    }
  }

  get truncatedOptions(): string[] | undefined {
    if (this.question.options) {
      if (this.question.options.length <= 6) {
        return this.question.options;
      } else {
        let truncatedList = [];
        // include one answer
        truncatedList.push(this.question.answers![Math.floor(Math.random() * this.question.answers!.length)]);

        // construct a list of all non-answers
        let distractors: string[] = _.shuffle(
          this.question.options.filter(o => this.question.answers?.indexOf(o) === -1)
        );

        this.log(`Modifying difficulty: ${this.modifyDifficulty}`);

        // if the question is hard for the user, show fewer distractors
        // [ ] todo: this should also affect the elo adjustments after the question is answered
        if (this.modifyDifficulty < -200) {
          distractors = distractors.slice(0, 1);
        } else if (this.modifyDifficulty < -150) {
          distractors = distractors.slice(0, 2);
        } else if (this.modifyDifficulty < -100) {
          distractors = distractors.slice(0, 3);
        } else if (this.modifyDifficulty < -50) {
          distractors = distractors.slice(0, 4);
        } else {
          distractors = distractors.slice(0, 5);
        }
        // push 5 of them to the returned list
        truncatedList.push(...distractors);

        // and SHUFFLE before passing to the radioMC renderer.
        // because it displays items in the order recieved (dumb UI component)
        return _.shuffle(truncatedList);
      }
    }
  }

  /**
   * returns a random member of the 'answers' string[] if
   * the question has 'answers' data. Used in the default case
   * to dispaly
   */
  get someAnswer(): string | undefined {
    if (this.question.answers) {
      return this.question.answers[Math.floor(this.question.answers.length * Math.random())];
    }
  }

  get isQuestion(): boolean {
    if (!this.question.answers || this.question.answers.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  private created() {}
}
</script>

<style lang="css" scoped>
canvas {
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
}

img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  max-height: 60vh;
  padding: 10px;
}
</style>

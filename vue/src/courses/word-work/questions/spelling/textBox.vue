<template>
  <div>
    <span class="headline"> Spell the word: </span>
    <UserInputString />
    <center>
      <span v-if="priorAttempts !== 0" class="title">
        {{ question.word }}
      </span>
    </center>
    <center>
      <audio-auto-player :src="[getURL('WordAudio'), getURL('SentenceAudio'), getURL('WordAudio')]" />
    </center>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SpellingQuestion } from '@/courses/word-work/questions/spelling';
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';
import UserInputString from '@/base-course/Components/UserInput/UserInputString.vue';
import { log } from 'util';

@Component({
  components: {
    AudioAutoPlayer,
    UserInputString,
  },
})
export default class IdentifyVocab extends QuestionView<SpellingQuestion> {
  public answer: string = '';
  get question() {
    return new SpellingQuestion(this.data);
  }

  public submit() {
    this.question.isCorrect(this.answer);
  }
}
</script>

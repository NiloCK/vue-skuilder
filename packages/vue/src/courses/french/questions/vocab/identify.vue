<template>
  <div>This is a vocabulary question.</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { VocabQuestion } from '@/courses/french/questions/vocab';
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';
import UserInputString from '@/base-course/Components/UserInput/UserInputString.vue';

@Component({
  components: {
    AudioAutoPlayer,
    UserInputString,
  },
})
export default class IdentifyVocab extends QuestionView<VocabQuestion> {
  get question() {
    t;
    return new VocabQuestion(this.data);
  }
}
</script>

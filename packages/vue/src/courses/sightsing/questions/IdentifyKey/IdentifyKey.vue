<template>
  <div>
    <MusicScoreRenderer v-bind:keySignature="`X:1\nK:${question.key}\n||`" />
    This signature is for the major key: _____
    <RadioSelect v-bind:choiceList="choices" />
  </div>
</template>

<script lang="ts">
import RadioSelect from '@/base-course/Components/RadioMultipleChoice.vue';
import { QuestionView } from '@/base-course/Viewable';
import MusicScoreRenderer from '@/courses/components/MusicScoreRender.vue';
import Component from 'vue-class-component';
import { IdentifyKeyQuestion, keys } from './index';

function fiveRandomKeys() {
  const randomKeys = [];
  for (let i = 0; i < 5; i++) {
    randomKeys.push(keys[Math.floor(Math.random() * keys.length)]);
  }
  return randomKeys;
}

@Component({
  components: {
    RadioSelect,
    MusicScoreRenderer,
  },
})
export default class IdentifyKeyView extends QuestionView<IdentifyKeyQuestion> {
  public answer: string = '';
  get question() {
    return new IdentifyKeyQuestion(this.data);
  }

  get choices() {
    const ch = fiveRandomKeys();
    if (ch.includes(this.question.key)) {
      return ch;
    } else {
      ch[Math.floor(Math.random() * ch.length)] = this.question.key;
      return ch;
    }
  }

  public submit() {}
}
</script>

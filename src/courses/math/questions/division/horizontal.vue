<template>
  <div>
      {{question.data.a * question.data.b}} &divide; {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Viewable from '@/base-course/Viewable.vue';
import { SingleDigitDivisionQuestion, SingleDigitDivisionQuestionProps } from './index';

@Component
export default class DivisionHorizontal extends Viewable {
  public answer: string = '';

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }

  get question() {
    return new SingleDigitDivisionQuestion(this.data as SingleDigitDivisionQuestionProps);
  }
}
</script>

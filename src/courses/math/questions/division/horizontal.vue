<template>
  <div>
      {{question.a * question.b}} &divide; {{question.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitDivisionQuestion } from './index';

@Component
export default class DivisionHorizontal extends QuestionView<SingleDigitDivisionQuestion> {
  public answer: string = '';

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }

  get question() {
    return new SingleDigitDivisionQuestion(this.data);
  }
}
</script>

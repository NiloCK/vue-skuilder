<template>
  <div>
      {{question.data.a * question.data.b}} &divide; {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitDivisionQuestion, SingleDigitDivisionQuestionProps } from './index';

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

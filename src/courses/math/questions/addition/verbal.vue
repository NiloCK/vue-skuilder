<template>
  <div>
      {{question.a}} plus {{question.b}} is 
      <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitAdditionQuestion } from './index';

@Component
export default class VerbalAddition extends QuestionView<SingleDigitAdditionQuestion> {
  public answer: string = '';
  get question() {
    return new SingleDigitAdditionQuestion([this.data]);
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

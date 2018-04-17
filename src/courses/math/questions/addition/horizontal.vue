<template>
  <div>
      {{question.data.a}} + {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SingleDigitAdditionQuestion } from './index';
import { QuestionView } from '@/base-course/Viewable';

@Component
export default class AdditionHorizontal extends QuestionView<SingleDigitAdditionQuestion> {
  public answer: string = '';

  public get question() {
    return new SingleDigitAdditionQuestion();
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

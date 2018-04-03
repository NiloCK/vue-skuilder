<template>
  <div>
      {{question.data.a}} &times; {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Viewable from '@/base-course/Viewable.vue';
import { SingleDigitMultiplicationQuestion } from './index';

@Component
export default class MultiplicationHorizontal extends Viewable {
  public answer: string = '';
  @Prop()
  public question: SingleDigitMultiplicationQuestion = new SingleDigitMultiplicationQuestion();

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

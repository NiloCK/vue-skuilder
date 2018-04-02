<template>
  <div>
      {{question.data.a * question.data.b}} / {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

// todo replace '/' in the question with the correct 'division' symbol

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Viewable from '@/courses/base/Viewable.vue';
import { SingleDigitDivisionQuestion } from './index';

@Component
export default class MultiplicationHorizontal extends Viewable {
  public answer: string = '';
  @Prop()
  public question: SingleDigitDivisionQuestion = new SingleDigitDivisionQuestion();

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

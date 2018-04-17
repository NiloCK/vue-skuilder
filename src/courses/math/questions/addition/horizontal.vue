<template>
  <div>
      {{question.data.a}} + {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Viewable from '@/base-course/Viewable';
import { SingleDigitAdditionQuestion } from './index';

@Component
export default class AdditionHorizontal extends Viewable {
  public answer: string = '';
  @Prop()
  public question: SingleDigitAdditionQuestion = new SingleDigitAdditionQuestion();

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

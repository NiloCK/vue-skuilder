<template>
  <div>
      {{question.a}} + {{question.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SingleDigitAdditionQuestion } from './index';
import { QuestionView } from '@/base-course/Viewable';
import { randomInt } from '@/courses/math/utility';

@Component
export default class AdditionHorizontal extends QuestionView<SingleDigitAdditionQuestion> {
  public answer: string = '';

  public get question() {
    return new SingleDigitAdditionQuestion(this.data);
  }

  public submit() {
    // alert(this.answer);
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

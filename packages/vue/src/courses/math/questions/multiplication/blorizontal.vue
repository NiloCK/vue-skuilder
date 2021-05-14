<template>
  <div>
    {{ question.a }} &times; {{ question.b }} =
    <UserInputNumber />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitMultiplicationQuestion } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';

@Component({
  components: {
    UserInputNumber,
  },
})
export default class MultiplicationHorizontal extends QuestionView<SingleDigitMultiplicationQuestion> {
  public answer: string = '';
  get question() {
    return new SingleDigitMultiplicationQuestion(this.data);
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

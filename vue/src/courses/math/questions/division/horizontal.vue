<template>
  <div>
    {{ question.a * question.b }} &divide; {{ question.b }} =
    <UserInputNumber />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitDivisionQuestion } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';

@Component({
  components: {
    UserInputNumber,
  },
})
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

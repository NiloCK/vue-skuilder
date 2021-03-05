<template>
  <div>
    {{ question.a }} plus {{ question.b }} is
    <!-- <input type="number" v-model="answer" @keyup.enter="submitAnswer(answer)" /> -->
    <UserInputNumber />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SingleDigitAdditionQuestion } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';

@Component({
  components: {
    UserInputNumber,
  },
})
export default class VerbalAddition extends QuestionView<SingleDigitAdditionQuestion> {
  public answer: string = '';
  get question() {
    return new SingleDigitAdditionQuestion(this.data);
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

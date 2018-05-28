<template>
  <div>
      {{question.a}} &equals; {{question.b}} 
        <MultipleChoice />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { EqualityTest } from './index';
import MultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';

@Component({
    components: {
        MultipleChoice
    }
})
export default class TrueFalse extends QuestionView<EqualityTest> {
  public answer: string = '';

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }

  get question() {
    return new EqualityTest(this.data);
  }
}
</script>

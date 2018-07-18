<template>
  <div>
      {{question.a}} &equals; {{question.b}} 

      <TFSelect 
        v-bind:MouseTrap="MouseTrap"
        :submit="submit"
      />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { EqualityTest } from './index';
import TFSelect from '@/base-course/Components/TrueFalse.vue';

@Component({
  components: {
    TFSelect
  }
})
export default class TrueFalse extends QuestionView<EqualityTest> {
  public answer: boolean;

  public submit(selection: number) {
    alert(
      this.question.isCorrect(selection === 0)
    );
  }

  get question() {
    // alert(`this.Mousetrap == ${Object.keys(this.MouseTrap)}`);
    return new EqualityTest(this.data);
  }
}
</script>

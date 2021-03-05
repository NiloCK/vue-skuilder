<template>
  <div>
    <h4>Solve the Equation</h4>
    <br /><br />
    <div v-if="question.operation.valueOf() === 'ADDITION'">
      {{ variable || 'r' }} - {{ question.a }} = {{ question.b }}
    </div>
    <div v-else-if="question.operation.valueOf() === 'SUBTRACTION'">
      {{ variable || 'r' }} + {{ question.a }} = {{ question.b }}
    </div>
    <div v-else-if="question.operation.valueOf() === 'MULTIPLICATION'">
      {{ variable || 'r' }} &#247; {{ question.a }} = {{ question.b }}
    </div>
    <div v-else-if="question.operation.valueOf() === 'DIVISION'">
      {{ variable || 'r' }} * {{ question.a }} = {{ question.b * question.a }}
    </div>
    <div v-else>No operation!? (This should never show)</div>

    <br /><br />

    {{ variable || 'r' }} = <UserInputNumber />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { OneStepEquation } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';
import { randomInt } from '../../utility';
import { log } from 'util';

@Component({
  components: {
    UserInputNumber,
  },
})
export default class Solve extends QuestionView<OneStepEquation> {
  public answer: string = '';
  public variable: string = 'r';

  constructor() {
    super();
    const vars = ['a', 'b', 'd', 'A', 'z', 'B', 'd', 'y'];
    this.variable = vars[randomInt(0, vars.length)];
  }
  get question() {
    return new OneStepEquation(this.data);
  }

  public submit() {
    alert(this.question.isCorrect(parseInt(this.answer, 10)));
  }
}
</script>

<template>
  <div class="headline">
    <div class="headline"> Count by <strong>{{question.n}}</strong>s: </div>

    <input type="text" disabled class="correct" :value="question.answer[0] - question.n">, 

    <span v-for="(a, i) in question.answer" :key="i">

      <input 
        type="text"
        
        :id="`input${i}`"
        :ref="`input${i}`"        
        @keyup="track(i)"
        v-model="answer[i]"
        :autofocus="i === 0"
      >
      <span v-if="i !== question.answer.length - 1">, </span>
    </span>
      
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { CountBy } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';

@Component({
  components: {
    UserInputNumber
  }
})
export default class VerbalAddition extends QuestionView<CountBy> {
  public answer: string[] = ["", "", "", "", ""];
  get question() {
    return new CountBy(this.data);
  }

  public track(n: number): void {
    console.log(`change in ${n}!
    userAnswer: ${this.answer.toString()}\n
    qAnswer:    ${this.question.answer.toString()}`);
    if (this.question.answer[n].toString().length === this.answer[n].length) {
      if (parseInt(this.answer[n]) === this.question.answer[n]) {
        // this.$refs["" + (n + 1)].focus();
        // this.$refs["" + n].classList.add('correct');
        document.getElementById('input' + n)!.classList.add('correct');
        document.getElementById('input' + n)!.classList.remove('incorrect');
        document.getElementById('input' + n)!.setAttribute('disabled', 'true');
        if (n + 1 < this.answer.length) {
          // move to next box
          document.getElementById('input' + (n + 1))!.focus();
        } else {
          this.submitAnswer(this.answer);
        }
      } else {
        document.getElementById('input' + n)!.classList.add('incorrect');
        this.submitAnswer(this.answer);
        console.log(`Wrong! ${this.answer[n]} !== ${this.question.answer[n]}`);
      }
    }
  }

  public $refs: {
    input0: HTMLInputElement[];
    input1: HTMLInputElement[];
    input2: HTMLInputElement[];
    input3: HTMLInputElement[];
    input4: HTMLInputElement[];

    // [index: string]: HTMLInputElement;
  }

  public mounted() {
    console.log('focusingb...');
    this.$refs.input0[0].focus();
  }


  public submit() {

    // alert(this.question.isCorrect(parseInt(this.answer, 10)));'
  }
}
</script>

<style scoped>
input {
  width: 3em;
  /* border: black; */
  border-style: solid;
  border-bottom-color: black;
  border-width: 1px;
  text-align: center;
  /* background-color: red; */
}

.incorrect {
  box-shadow: 0px 0px 5px 0px rgb(180, 0, 95);
}
.correct {
  box-shadow: 0px 0px 5px 0px green;
}
</style>
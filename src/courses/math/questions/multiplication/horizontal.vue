<template>
  <div>
      {{question.data.a}} &times; {{question.data.b}} = 
       <input type="text" v-model="answer" @keyup.enter="submit" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Viewable from "@/courses/base/Viewable.vue";
import { SingleDigitMultiplicationQuestion } from "./index";

@Component
export default class multiplicationHorizontal extends Viewable {
  answer: string = "";
  @Prop()
  question: SingleDigitMultiplicationQuestion = new SingleDigitMultiplicationQuestion();

  submit() {
    alert(this.question.isCorrect(parseInt(this.answer)));
  }
}
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { randomInt } from '@/courses/math/utility';

export default {
  // problem: SingleDigitMultiplicationQuestion = new SingleDigitMultiplicationQuestion();
  data: () => {
    return {
      type: 'Viewable',
      problem: new SingleDigitMultiplicationQuestion(
        [{
          a: randomInt(0, 10),
          b: randomInt(0, 10)
        }]
      )
    };
  },
  components: {
  }
};
</script>

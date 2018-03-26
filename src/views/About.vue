<template>
  <div class="about">
    <h1>This is an about page</h1>
    <component v-bind:is="type" data="awefzvitawezfvitawef"/>
    <multiplication-horizontal v-bind:question="problem" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Viewable from '@/courses/base/Viewable.vue';
import multiplicationHorizontal from '@/courses/math/questions/multiplication/horizontal.vue';
import { Component } from 'vue-property-decorator';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';

export default {
  // problem: SingleDigitMultiplicationQuestion = new SingleDigitMultiplicationQuestion();
  data: () => {
    return {
      type: 'Viewable',
      problem: new SingleDigitMultiplicationQuestion()
    };
  },
  components: {
    Viewable,
    multiplicationHorizontal
  }
};
</script>

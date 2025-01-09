<template>
  <div class="about">
    <h1>Todo.</h1>

    <p>This is a placeholder for the about page. It will be filled in with more information later.</p>

    <router-link to="./notes">Release Notes</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { randomInt } from '@/courses/math/utility';

export default defineComponent({
  name: 'About',
  data() {
    return {
      type: 'Viewable',
      problem: new SingleDigitMultiplicationQuestion([
        {
          a: randomInt(0, 10),
          b: randomInt(0, 10),
        },
      ]),
    };
  },
  components: {},
});
</script>

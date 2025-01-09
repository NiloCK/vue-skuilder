<template>
  <div class="about">
    <h1>This is an about page</h1>
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

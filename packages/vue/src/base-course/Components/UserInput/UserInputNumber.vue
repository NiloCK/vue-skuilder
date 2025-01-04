<template>
  <!-- <input
        class='userInput'
        type="number"
        v-model="answer"
        @keyup.enter="submitAnswer(strToNumber(answer))"
    /> -->
  <v-text-field
    v-model="answer"
    prepend-icon="edit"
    @keyup.enter="submitAnswer(strToNumber(answer))"
    :autofocus="autofocus"
    row-height="24"
    toggle-keys="[13,32]"
    type="text"
    class="headline"
  ></v-text-field>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserInput from './UserInput';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default defineComponent({
  name: 'UserInputNumber',
  mixins: [SkldrVueMixin],
  extends: UserInput,
  
  mounted() {
    this.$el.focus();
  },

  methods: {
    strToNumber(num: string): number {
      return Number.parseFloat(num);
    }
  }
});
</script>

<style scoped>
.userInput {
  border: none;
  text-align: center;
  border-bottom: 1px black;
}
</style>

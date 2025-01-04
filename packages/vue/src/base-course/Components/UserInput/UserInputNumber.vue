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
// Composition API Version
import { onMounted, getCurrentInstance } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import type { UserInput } from './UserInput';

// Get skldr utilities
const { log, error, warn } = SkldrComposable();

// Props should match those from UserInput base class
defineProps<{
  autofocus?: boolean,
  answer: string
}>();

// Emits should match those from UserInput base class
defineEmits<{
  (e: 'submit', value: number): void
}>();

const strToNumber = (num: string): number => {
  return Number.parseFloat(num);
};

onMounted(() => {
  getCurrentInstance()?.proxy?.$el.focus();
});
</script>

<style scoped>
.userInput {
  border: none;
  text-align: center;
  border-bottom: 1px black;
}
</style>

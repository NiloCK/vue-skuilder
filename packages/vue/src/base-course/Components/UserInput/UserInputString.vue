<template>
  <v-text-field
    ref="input"
    :model-value="answer"
    :prepend-icon="prependIcon"
    :autofocus="autofocus"
    type="text"
    class="text-h5"
    single-line
    hide-details
    @update:model-value="onInput"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @keyup.enter="submitAnswer(answer)"
  ></v-text-field>
</template>

<script lang="ts">
import UserInput from './OptionsUserInput';
import { defineComponent } from 'vue';

// interface InputStringRefs {
//   input: HTMLInputElement;
// }

export default defineComponent({
  name: 'UserInputString',
  extends: UserInput,

  props: {
    icon: {
      type: Boolean,
      required: false,
    },
  },

  data() {
    return {
      isComposing: false,
    };
  },

  computed: {
    prependIcon(): string {
      return this.icon ? 'edit' : '';
    },
  },

  mounted() {
    (this.$refs.input as HTMLInputElement)?.focus();
  },

  methods: {
    onInput(e: Event | string) {
      if (typeof e === 'string') {
        this.answer = e;
        return;
      }
      const target = e.target as HTMLInputElement;
      console.log('Input event value:', target.value);
      if (!this.isComposing) {
        this.answer = target.value;
      }
    },

    onCompositionStart() {
      console.log('Composition started');
      this.isComposing = true;
    },

    onCompositionEnd(e: CompositionEvent) {
      console.log('Composition ended:', e.data);
      this.isComposing = false;
      const target = e.target as HTMLInputElement;
      this.answer = target.value;
    },
  },
});
</script>

<style scoped>
.v-text-field {
  padding: 0;
}
input {
  text-align: center !important;
}
</style>

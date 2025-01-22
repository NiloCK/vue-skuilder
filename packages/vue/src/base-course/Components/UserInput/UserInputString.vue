<template>
  <!-- <v-text-field
    ref="input"
    v-model="answer"
    :prepend-icon="prependIcon"
    :autofocus="autofocus"
    type="text"
    class="text-h5"
    single-line
    hide-details
    @keyup.enter="submitAnswer(answer)"
  ></v-text-field> -->
  <span>
    <!-- <input ref="input" v-model="answer" type="text" /> -->
    <v-text-field
      v-model="answer"
      :autofocus="autofocus"
      :prepend-icon="prependIcon"
      type="text"
      variant="underlined"
      class="text-h5"
      single-line
      hide-details
      @keyup.enter="submitAnswer(answer)"
    ></v-text-field>
    <!-- Current answer: {{ answer }} -->
  </span>
</template>

<script lang="ts">
// @compositionstart="onCompositionStart"
// @compositionend="onCompositionEnd"
import UserInput from './OptionsUserInput';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UserInputString',
  extends: UserInput,

  props: {
    icon: {
      type: Boolean,
      required: false,
    },
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
    // debugInput(e: Event) {
    //   const target = e.target as HTMLInputElement;
    //   console.log('Input event:', {
    //     value: target.value,
    //     currentAnswer: this.answer,
    //     target,
    //   });
    // },
    // debugKeyup(e: KeyboardEvent) {
    //   const target = e.target as HTMLInputElement;
    //   console.log('Keyup event:', {
    //     key: e.key,
    //     value: target.value,
    //     currentAnswer: this.answer,
    //     target,
    //   });
    // },
  },
});
</script>

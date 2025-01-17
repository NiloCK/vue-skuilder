<template>
  <v-text-field
    v-model="answer"
    :prepend-icon="prependIcon"
    :autofocus="autofocus"
    toggle-keys="[13,32]"
    type="text"
    class="text-h5"
    single-line
    hide-details
    hide-headers
    ref="input"
    hide-overlay
    @keyup.enter="submitAnswer(answer)"
  ></v-text-field>
</template>

<script lang="ts">
import UserInput from './OptionsUserInput';
import { defineComponent, PropType } from 'vue';

interface InputStringRefs {
  input: HTMLInputElement;
}

type InputStringInstance = ReturnType<typeof defineComponent> & {
  $refs: InputStringRefs;
};

export default defineComponent({
  name: 'UserInputString',

  extends: UserInput,

  ref: {} as InputStringRefs,

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

  methods: {
    mounted(this: InputStringInstance) {
      this.$refs.input.focus();
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

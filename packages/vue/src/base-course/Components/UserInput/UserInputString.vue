<template>
  <v-text-field
    v-model="answer"
    :prepend-icon="prependIcon"
    @keyup.enter="submitAnswer(answer)"
    :autofocus="autofocus"
    toggle-keys="[13,32]"
    type="text"
    class="headline"
    single-line
    hide-details
    hide-headers
    hide-overlay
    ref="input"
  ></v-text-field>
</template>

<script lang="ts">
// import { Component, Prop, Vue } from 'vue-property-decorator';
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

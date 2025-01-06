<template>
  <v-textarea
    box
    ref="inputField"
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:autofocus="autofocus"
    v-on:input="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FieldInput } from '../FieldInput';
import SimpleMDE from 'simplemde';

export default defineComponent({
  name: 'MarkdownInput',
  extends: FieldInput,
  computed: {
    validators() {
      const ret = FieldInput.prototype.validators;
      return ret;
    }
  },
  mounted() {}
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css');
</style>

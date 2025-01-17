<template>
  <v-textarea
    ref="inputField"
    v-model="store[field.name]"
    variant="filled"
    :name="field.name"
    :label="field.name"
    :autofocus="autofocus"
    @update:model-value="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FieldInput from '../OptionsFieldInput';
import SimpleMDE from 'simplemde';

export default defineComponent({
  name: 'MarkdownInput',
  extends: FieldInput,
  computed: {
    validators() {
      const ret = FieldInput.computed?.validators;
      return ret;
    },
  },
  mounted() {},
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css');
</style>

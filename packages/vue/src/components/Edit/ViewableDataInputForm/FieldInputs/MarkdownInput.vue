<template>
  <v-textarea
    box
    ref="inputField"
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-on:input="validate"
  />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';
import SimpleMDE from 'simplemde';

@Component
export default class MarkdownInput extends FieldInput {
  public get validators() {
    const ret = super.validators;
    return ret;
  }

  public mounted() {}
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css');
</style>

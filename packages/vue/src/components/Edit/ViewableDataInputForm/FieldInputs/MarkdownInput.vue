<template>
  <!-- <v-text-field
        ref="inputField"
        box
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @input="validate"
        :rules="vuetifyRules()"
    /> -->
  <!-- <textarea
        ref="inputField"
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @input="validate"
        :rules="vuetifyRules()"
        
    ></textarea> -->
  <v-textarea
    box
    ref="inputField"
    v-model="store[field.name]"
    :name="field.name"
    :label="field.name"
    @input="validate"
  />
  <!-- :rules="vuetifyRules()" -->
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

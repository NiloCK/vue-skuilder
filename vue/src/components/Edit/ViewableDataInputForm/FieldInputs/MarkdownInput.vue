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
    <textarea
        ref="inputField"
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @input="validate"
        :rules="vuetifyRules()"
        
    ></textarea>
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

  public mounted() {
    const editor = new SimpleMDE({
      element: this.$refs.inputField,
      status: false,
      placeholder: this.field.name,
    });

    this.$refs.inputField.onkeydown = this.validate;
  }
}
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css");
</style>

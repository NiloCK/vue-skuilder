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
    id="wheredoesthisendup"
    v-model="store[field.name]"
    :name="field.name"
    :label="field.name"
    @input="validate"
    @change="console.log('hi')"
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

  private mde: SimpleMDE;

  public mounted() {
    // this.mde = new SimpleMDE({
    //   element: document.getElementById('wheredoesthisendup')!,
    //   status: false,
    //   placeholder: this.field.name,
    //   autofocus: true,
    //   showIcons: ['Bold'],
    //   hideIcons: ['Italic'],
    //   toolbar: false
    // });
    // // this.$refs.inputField.onkeydown = () => this.validate();
    // // this.$refs.inputField.onkeypress = () => console.log(`keypress`);
    // requestAnimationFrame(this.syncValue);
  }

  private syncValue() {
    console.log(`happening...`);
    if (this.$refs.inputField.value !== this.mde.value()) {
      console.log(`updated!`);
      this.$refs.inputField.value = this.mde.value();
      this.$refs.inputField.checkValidity();
      this.validate();
    }
    requestAnimationFrame(this.syncValue);
  }
}

document.createElement('blockquote');
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css');
</style>

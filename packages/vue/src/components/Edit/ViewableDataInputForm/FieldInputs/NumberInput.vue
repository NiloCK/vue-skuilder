<template>
  <v-text-field
    ref="inputField"
    box
    type="number"
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:rules="vuetifyRules()"
    v-bind:autofocus="autofocus"
    v-on:input="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { numberValidator } from './typeValidators';
import FieldInput from '../OptionsFieldInput';

export default defineComponent({
  name: 'NumberInput',
  extends: FieldInput,
  computed: {
    validators(): Array<(v: any) => boolean | string> {
      const parentValidators = FieldInput.options?.computed?.validators?.call(this) || [];
      return [numberValidator, ...parentValidators];
    },
  },
});
</script>

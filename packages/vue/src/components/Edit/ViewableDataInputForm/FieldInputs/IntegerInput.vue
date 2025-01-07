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
import { integerValidator } from './typeValidators';
import FieldInput from '../OptionsFieldInput';

export default defineComponent({
  name: 'IntegerInput',
  extends: FieldInput,
  computed: {
    validators(): Function[] {
      const baseValidators = FieldInput.computed?.validators.call(this);
      const ret = [integerValidator];
      if (baseValidators) {
        return ret.concat(baseValidators);
      }
      console.log(`validators for ${this.field.name} has ${ret.length} entries`);
      return ret;
    },
  },
});
</script>

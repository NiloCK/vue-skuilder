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
import { log } from 'util';
import { FieldInput } from '../FieldInput';

export default defineComponent({
  name: 'IntegerInput',
  extends: FieldInput,
  computed: {
    validators(): Function[] {
      const ret = (this as InstanceType<typeof FieldInput>).validators;
      ret.unshift(integerValidator);
      log(`validators for ${this.field.name} has ${ret.length} entries`);
      return ret;
    }
  }
});
</script>

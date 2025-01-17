<template>
  <v-text-field
    ref="inputField"
    v-model="store[field.name]"
    variant="filled"
    type="number"
    :name="field.name"
    :label="field.name"
    :rules="vuetifyRules()"
    :autofocus="autofocus"
    @update:model-value="() => validate()"
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

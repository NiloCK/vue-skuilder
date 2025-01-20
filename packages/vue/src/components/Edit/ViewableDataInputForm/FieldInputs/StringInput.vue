<template>
  <v-text-field
    ref="inputField"
    v-model="store[field.name]"
    variant="filled"
    type="text"
    :name="field.name"
    :label="field.name"
    :rules="vuetifyRules()"
    :autofocus="autofocus"
    @update:model-value="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FieldInput from '../OptionsFieldInput';
import { ValidatingFunction } from '../../../../base-course/Interfaces/ValidatingFunction';

export default defineComponent({
  name: 'StringInput',
  extends: FieldInput,

  computed: {
    validators(): ValidatingFunction[] {
      const baseValidators = FieldInput.computed?.validators.call(this);
      if (baseValidators) {
        return baseValidators;
      } else {
        return [];
      }
    },
  },
});
</script>

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

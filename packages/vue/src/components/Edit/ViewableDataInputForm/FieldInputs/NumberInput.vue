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
    v-on:input="validate"
  />
</template>

<script lang="ts">
// Composition API Version
import { defineComponent } from 'vue';
import { numberValidator } from './typeValidators';
import FieldInput from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { SkldrComposable } from '@/mixins/SkldrComposable';

const props = defineProps({
  ...FieldInput.props // Inheriting props from FieldInput
});

const { log, error, warn } = SkldrComposable();

// Extend validators from parent
const validators = computed(() => {
  const parentValidators = FieldInput.setup?.(props)?.validators || [];
  return [numberValidator, ...parentValidators];
});
</script>

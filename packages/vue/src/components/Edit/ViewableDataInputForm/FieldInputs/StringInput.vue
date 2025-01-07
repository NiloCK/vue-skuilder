<template>
  <v-text-field
    ref="inputField"
    box
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:rules="vuetifyRules()"
    v-bind:autofocus="autofocus"
    v-on:input="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import FieldInput from '../OptionsFieldInput';
import { FieldDefinition } from '../../../../base-course/Interfaces/FieldDefinition';

export default defineComponent({
  name: 'StringInput',
  extends: FieldInput,

  props: {
    autofocus: Boolean,
    field: Object as PropType<FieldDefinition>,
    store: {
      type: Object as PropType<any>,
      required: true,
    },
    uiValidationFu2nction: {
      type: Function as PropType<() => boolean>,
      required: true,
    },
  },
});
</script>

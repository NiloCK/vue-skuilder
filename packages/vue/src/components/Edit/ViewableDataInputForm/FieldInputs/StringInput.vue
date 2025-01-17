<template>
  <v-text-field
    ref="inputField"
    v-model="store[field.name]"
    variant="filled"
    :name="field.name"
    :label="field.name"
    :rules="vuetifyRules()"
    :autofocus="autofocus"
    @update:model-value="() => validate()"
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

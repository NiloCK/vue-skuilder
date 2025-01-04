<template>
  <v-text-field
    ref="inputField"
    box
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:rules="vuetifyRules()"
    v-bind:autofocus="autofocus"
    v-on:input="validate"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import type { PropType } from 'vue';
import type { Field } from '../types'; // Assuming this type exists

export default defineComponent({
  name: 'StringInput',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true
    },
    store: {
      type: Object as PropType<Record<string, any>>,
      required: true
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { log, warn, error } = SkldrComposable();

    const vuetifyRules = () => {
      const rules: Array<(v: any) => boolean | string> = [];
      
      if (props.field.required) {
        rules.push((v: any) => !!v || `${props.field.name} is required`);
      }
      
      return rules;
    };

    const validate = () => {
      emit('validate');
    };

    return {
      vuetifyRules,
      validate
    };
  }
});
</script>

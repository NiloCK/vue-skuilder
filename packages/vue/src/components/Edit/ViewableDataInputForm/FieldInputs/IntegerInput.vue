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
import { defineComponent } from 'vue';
import { integerValidator } from './typeValidators';
import { log } from 'util';
import { FieldInput } from '../FieldInput';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default defineComponent({
  name: 'IntegerInput',
  mixins: [FieldInput, SkldrVueMixin],
  computed: {
    validators() {
      // @ts-expect-error - FieldInput mixin type not properly recognized
      const parentValidators = this.$options.supers.FieldInput.computed.validators.call(this);
      parentValidators.unshift(integerValidator);
      log(`validators for ${this.field.name} has ${parentValidators.length} entries`);
      return parentValidators;
    }
  }
});
</script>

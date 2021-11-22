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
import { Component } from 'vue-property-decorator';
import { numberValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({})
export default class NumberInput extends FieldInput {
  public get validators() {
    const ret = super.validators;
    ret.unshift(numberValidator);
    return ret;
  }
}
</script>

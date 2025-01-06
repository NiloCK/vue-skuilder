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
import { Component } from 'vue-property-decorator';
import { integerValidator } from './typeValidators';
// import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { log } from 'util';
import { FieldInput } from '../FieldInput';

@Component({})
export default class IntegerInput extends FieldInput {
  public get validators() {
    const ret = super.validators;
    ret.unshift(integerValidator);
    log(`validators for ${this.field.name} has ${ret.length} entries`);
    return ret;
  }
}
</script>

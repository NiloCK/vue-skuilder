<template>
    <div>
        <input type="number" v-bind:name="field.name">
        <label v-bind:for="field.name">{{field.name}}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { integerValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({})
export default class IntegerInput extends FieldInput {
  @Prop() public field: FieldDefinition;

  public getValidators(): ValidatingFunction[] {
    const ret = [integerValidator];

    if (this.field.validator) {
        ret.push(this.field.validator.test);
    }
    return ret;
  }
}
</script>

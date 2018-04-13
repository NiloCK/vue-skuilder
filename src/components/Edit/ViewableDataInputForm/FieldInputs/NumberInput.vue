<template>
    <div>
        <label v-bind:for="field.name">{{field.name}}: </label>
        <input
            v-model="store[field.name]"
            v-bind:name="field.name"
            @change="validate"
            type="number"            
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { numberValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({})
export default class NumberInput extends FieldInput {

  public getValidators(): ValidatingFunction[] {
    const ret = [numberValidator];

    if (this.field.validator) {
        ret.push(this.field.validator.test);
    }
    return ret;
  }
}
</script>

<style scoped>
@import './FieldInput.css'
</style>

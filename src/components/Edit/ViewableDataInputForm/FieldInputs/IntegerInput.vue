<template>
    <div>
        <label v-bind:for="field.name">{{field.name}}: </label>
        <input 
            v-model="store[field.name]"
            v-bind:name="field.name"
            v-on:change="validate"
            type="number"
            v-bind:class="validationStatus.status"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { integerValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { ValidationResult } from '@/base-course/Interfaces/ValidationResult';
import { Status } from '@/enums/Status';

@Component({})
export default class IntegerInput extends FieldInput {

  public getValidators(): ValidatingFunction[] {
    const ret = [integerValidator];

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

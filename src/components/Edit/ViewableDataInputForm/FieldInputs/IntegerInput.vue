<template>
    <div>
        <input 
            v-model="store[field.name]"
            v-bind:name="field.name"
            v-on:change="validate"
            type="number"
            v-bind:class="validationStatus.status"
        />
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
import { ValidationResult } from '@/base-course/Interfaces/ValidationResult';
import { Status } from '@/enums/Status';

@Component({})
export default class IntegerInput extends FieldInput {

  public getValidators(): ValidatingFunction[] {
    alert('getValidators has started');
    const ret = [integerValidator];

    if (this.field.validator) {
        ret.push(this.field.validator.test);
    }
    return ret;
  }
}
</script>

<style scoped>
/* todo: see how to import this styling
so that it can be shared among the other inputs
 */
.ok {
    box-shadow: 10px 5px 5px green;
}
.error {
    box-shadow: 10px 5px 5px red;
}
</style>

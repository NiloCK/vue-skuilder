<template>
    <div>
        <input type="text" v-bind:name="field.name">
        <label v-bind:for="field.name">{{field.name}}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import {
  FieldDefinition,
  FieldType,
  ValidatingFunction
} from '@/base-course/Course';
import { integerValidator } from './typeValidators';

@Component({})
export default class IntegerInput extends Vue {
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

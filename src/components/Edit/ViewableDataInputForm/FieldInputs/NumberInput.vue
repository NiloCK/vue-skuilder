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
import { numberValidator } from './typeValidators';

@Component({})
export default class NumberInput extends Vue {
  @Prop() public field: FieldDefinition;

  public getValidators(): ValidatingFunction[] {
    const ret = [numberValidator];

    if (this.field.validator) {
        ret.push(this.field.validator.test);
    }
    return ret;
  }
}
</script>

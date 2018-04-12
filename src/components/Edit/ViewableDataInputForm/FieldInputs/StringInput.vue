<template>
    <div>
        <input
            v-model="store[field.name]"
            v-bind:name="field.name"
            @change="validate"
            type="text"
            v-bind:class="validationStatus.status"
        >
        <label v-bind:for="field.name">{{field.name}}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldInput } from '../FieldInput';

@Component
export default class StringInput extends FieldInput {

  public getValidators(): ValidatingFunction[] {
      if (this.field.validator) {
          return [this.field.validator.test];
      } else {
          return [];
      }
  }
}
</script>

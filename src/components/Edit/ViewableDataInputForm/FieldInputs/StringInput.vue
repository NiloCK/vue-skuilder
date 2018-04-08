<template>
    <div>
        <input type="text" v-bind:name="field.name">
        <label v-bind:for="field.name">{{field.name}}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';

@Component
export default class StringInput extends Vue {
  @Prop() public field: FieldDefinition;

  public getValidators(): ValidatingFunction[] {
      if (this.field.validator) {
          return [this.field.validator.test];
      } else {
          return [];
      }
  }
}
</script>

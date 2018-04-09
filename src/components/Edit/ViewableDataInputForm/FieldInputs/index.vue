<template>
    <div>
        <div v-if="field.type === str">
            <StringInput v-model="input" v-bind:field="field" />
        </div>
        <div v-else-if="field.type === num">
            <NumberInput v-model="input" v-bind:field="field" />
        </div>
        <div v-else-if="field.type === int">
            <IntegerInput v-model="input" v-bind:field="field" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { FieldType } from '@/enums/FieldType';
import NumberInput from './NumberInput.vue';
import StringInput from './StringInput.vue';
import IntegerInput from './IntegerInput.vue';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({
    components: {
        NumberInput,
        StringInput,
        IntegerInput
    }
})
export default class FormInput extends FieldInput {
  @Prop() public field: FieldDefinition;
  public input: FieldInput;

  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;

  public getValidators(): ValidatingFunction[] {
      return this.input.getValidators();
  }
}
</script>

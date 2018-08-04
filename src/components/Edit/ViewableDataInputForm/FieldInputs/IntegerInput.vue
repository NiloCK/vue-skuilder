<template>
    <v-text-field
        box
        ref="inputField"
        type="number"
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        :id="'int_input_' + field.name"
        @change="validate"
        :rules="vuetifyRules"
    ></v-text-field>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { integerValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({})
export default class IntegerInput extends FieldInput {

    public getValidators() {
        const ret = super.getValidators();
        ret.push(integerValidator);
        return ret;
    }
}
</script>

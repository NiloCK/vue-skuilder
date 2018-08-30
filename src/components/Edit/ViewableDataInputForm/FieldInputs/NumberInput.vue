<template>
    <v-text-field
        ref="inputField"
        box
        type="number"
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @input="validate"
        :rules="vuetifyRules()"
    />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { numberValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';

@Component({})
export default class NumberInput extends FieldInput {

    public get validators() {
        const ret = super.validators;
        ret.unshift(numberValidator);
        return ret;
    }
}
</script>

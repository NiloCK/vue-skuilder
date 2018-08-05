<template>
    <v-text-field
        box
        type="number"
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @change="validate"
        :rules="vuetifyRules()"
    />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { integerValidator } from './typeValidators';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { log } from 'util';

@Component({})
export default class IntegerInput extends FieldInput {

    public get validators() {
        const ret = super.validators;
        ret.unshift(integerValidator);
        log(`validators for ${this.field.name} has ${ret.length} entries`);
        return ret;
    }
}
</script>

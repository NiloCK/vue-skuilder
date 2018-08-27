<template>
    <v-text-field
        ref="inputField"
        box
        v-model="store[field.name]"
        :name="field.name"
        :label="field.name"
        @change="validate"
        :rules="vuetifyRules()"
    />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';

@Component
export default class StringInput extends FieldInput { }
</script>

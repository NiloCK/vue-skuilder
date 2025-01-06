<template>
  <v-text-field
    ref="inputField"
    box
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:rules="vuetifyRules()"
    v-bind:autofocus="autofocus"
    v-on:input="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FieldInput } from '../FieldInput';

export default defineComponent({
  name: 'StringInput',
  extends: FieldInput
});
</script>

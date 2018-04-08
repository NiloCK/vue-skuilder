<template>
  <form action="">
      <div v-for="field in fields" :key="field.name" :value="field">
          <FieldInput v-bind:field="field" />
      </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Course';
import FieldInput from './FieldInputs/index.vue';

@Component({
    components: {
        FieldInput
    }
})
export default class DataInputForm extends Vue {
  @Prop() public fields: FieldDefinition[];

}
</script>


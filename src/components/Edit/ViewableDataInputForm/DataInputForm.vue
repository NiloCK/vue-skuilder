<template>
  <form autocomplete="off">
      <div v-for="field in dataShape.fields" :key="field.name" :value="field">
          <FieldInput v-bind:field="field" />
      </div>
      <button v-on:click="sayhi">Add Data</button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FieldInput from './FieldInputs/index.vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';

@Component({
    components: {
        FieldInput
    }
})
export default class DataInputForm extends Vue {
  @Prop() public dataShape: DataShape;

  public sayhi() {
      alert('hi');
  }
}
</script>


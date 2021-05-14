<template>
  <tr>
    <td v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
      {{ data[field.name] }}
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';

@Component
export default class DataShapeTableRows extends Vue {
  @Prop() private dataShape: DataShape;
  @Prop() private data: {};
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

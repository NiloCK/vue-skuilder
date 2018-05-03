<template>
  <thead>
      <th v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
          {{ field.name }}
      </th>
  </thead>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
// import Courses from '@/courses';
// import { getDataShapes } from '@/db';
// import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';

@Component
export default class DataShapeTableHeader extends Vue {
  @Prop() private dataShape: DataShape;
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

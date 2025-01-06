<template>
  <thead>
    <th v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
      {{ field.name }}
    </th>
  </thead>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
// import Courses from '@/courses';
// import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';

export default defineComponent({
  name: 'DataShapeTableHeader',
  props: {
    dataShape: {
      type: Object as PropType<DataShape>,
      required: true
    }
  }
});
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

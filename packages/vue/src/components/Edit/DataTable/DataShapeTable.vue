<template>
  <table>
    <DataShapeTableHeader v-bind:dataShape="dataShape" />
    <DataShapeTableRow v-for="row in data" :key="data.indexOf(row)" v-bind:data="row" v-bind:dataShape="dataShape" />
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import DataShapeTableHeader from './DataShapeTableHeader.vue';
import DataShapeTableRow from './DataShapeTableRow.vue';

export default defineComponent({
  name: 'DataShapeTable',
  
  components: {
    DataShapeTableHeader,
    DataShapeTableRow,
  },

  props: {
    dataShape: {
      type: Object as PropType<DataShape>,
      required: true
    },
    data: {
      type: Array as PropType<ViewData[]>,
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

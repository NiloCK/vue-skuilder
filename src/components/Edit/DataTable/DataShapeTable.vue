<template>
  <table>
      <DataShapeTableHeader v-bind:dataShape="dataShape" />
      <DataShapeTableRow
        v-for="row in data"
        :key="data.indexOf(row)" 
        v-bind:data="row"
        v-bind:dataShape="dataShape"
      />
  </table>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import DataShapeTableHeader from './DataShapeTableHeader.vue';
import DataShapeTableRow from './DataShapeTableRow.vue';

@Component({
  components: {
    DataShapeTableHeader,
    DataShapeTableRow
  }
})
export default class DataShapeTable extends Vue {
  @Prop() private dataShape: DataShape;
  @Prop() private data = [
    { a: 4, b: 6 },
    { b: 3, a: 5 }
  ];
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

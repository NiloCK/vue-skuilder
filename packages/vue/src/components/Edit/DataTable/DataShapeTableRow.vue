<template>
  <tr>
    <td v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
      {{ data[field.name] }}
    </td>
  </tr>
</template>

<script lang="ts">
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import { DataShape } from '@/base-course/Interfaces/DataShape';

export default {
  name: 'DataShapeTableRows',
  mixins: [SkldrVueMixin],
  props: {
    dataShape: {
      type: Object as () => DataShape,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

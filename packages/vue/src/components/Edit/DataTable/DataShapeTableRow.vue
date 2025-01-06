<template>
  <tr>
    <td v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
      {{ data[field.name] }}
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';

export default defineComponent({
  name: 'DataShapeTableRows',
  props: {
    dataShape: {
      type: Object as PropType<DataShape>,
      required: true
    },
    data: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    }
  }
});
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

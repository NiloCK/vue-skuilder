<template>
  <thead>
    <th v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
      {{ field.name }}
    </th>
  </thead>
</template>

<script lang="ts">
import type { DataShape } from '@/base-course/Interfaces/DataShape';

defineProps<{
  dataShape: DataShape
}>();
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

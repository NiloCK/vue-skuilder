<template>
  <div>
      This is {{ data }} displayable...
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';

@Component
export default class Viewable extends Vue {
  @Prop() public data: DisplayableData;
}
</script>

<style scoped>
div {
  padding: 10px;
  margin: 5px;
  border-style: solid;
  border-width: 1px;
}
</style>

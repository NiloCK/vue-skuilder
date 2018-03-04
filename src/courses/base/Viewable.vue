<template>
  <div>
      This is {{ data }} displayable...
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Viewable extends Vue {
  @Prop() data: any;
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

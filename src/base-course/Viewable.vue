<template>
  <div>
      This is {{ data }} displayable...
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DisplayableData } from "@/db/types";
import moment from "moment";

@Component
export default class Viewable extends Vue {
  @Prop() public data: any;
  protected startTime: moment.Moment;

  created() {
    this.startTime = moment();
  }
  /** 
   * Returns the time in MS since the element was created
   */
  getTime(): number {
    return moment().diff(this.startTime, "milliseconds");
  }
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

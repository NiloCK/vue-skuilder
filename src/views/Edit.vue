<template>
  <div>
      <h1>Editing Course Data</h1>
      <ul>
          <li v-for="item in viewables" :key="item.id">
              {{item}}
          </li>
      </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { testDataRetrieval } from "../db/index";

@Component({
  data() {
    return {
      viewables: []
    };
  }
})
export default class Edit extends Vue {
  public viewables: string[] = [];

  private created() {
    testDataRetrieval().then(info => {
      this.viewables = info.data;
    });
  }
}
</script>



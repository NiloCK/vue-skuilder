<template>
  <div>
      <select name="" id="" type="radio">
          <option value="a">a</option>
          <option value="b">b</option>
      </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator';

@Component({

})
export default class RadioSelect extends Vue {
    @Prop() public choiceList: string[] = ["hi", "bye"];
}
</script>

<style scoped>

</style>

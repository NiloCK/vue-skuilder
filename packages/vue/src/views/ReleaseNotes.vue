<template>
  <div>
    <h1 class="display-1">Release Notes</h1>

    <h3 class="headline">0.0.1 - April 21</h3>
    <ul>
      <li>Hello world, these are release notes.</li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import { log } from 'util';

@Component({})
export default class User extends Vue {}
</script>

<style scoped></style>

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
import { defineComponent } from 'vue';
import { log } from 'util';

export default defineComponent({
  name: 'ReleaseNotes'
});
</script>

<style scoped></style>

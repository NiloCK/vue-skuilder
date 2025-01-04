<template>
  <div id="abc"></div>
</template>

<script lang="ts">
// Options API Version
import abc from 'abcjs';

export default {
  name: 'MusicScoreRenderer',
  props: {
    abcString: {
      type: String,
      required: true
    }
  },
  mounted() {
    abc.renderAbc('abc', this.abcString);
  }
};
</script>

<style>
#abc {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <span class="text-h5">{{ text }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FillInText',

  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
</script>

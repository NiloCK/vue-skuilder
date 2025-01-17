<template>
  <v-toolbar dense>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    &nbsp;&nbsp; {{ subtitle }}
    <v-spacer></v-spacer>
    <v-btn variant="text" icon color="secondary" :disabled="page == 1" @click="() => $emit('first')">
      <v-icon>mdi-page-first</v-icon>
    </v-btn>
    <v-btn variant="text" icon color="secondary" :disabled="page == 1" @click="() => $emit('prev')">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-select
      v-model="page"
      :items="pages"
      class="pageSelect"
      @update:model-value="() => $emit('set-page', page)"
    ></v-select>
    <v-btn variant="text" icon color="secondary" :disabled="page == pages.length" @click="() => $emit('next')">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
    <v-btn variant="text" icon color="secondary" :disabled="page == pages.length" @click="() => $emit('last')">
      <v-icon>mdi-page-last</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'PaginatingToolbar',

  props: {
    pages: {
      type: Array as PropType<number[]>,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    subtitle: {
      type: String,
      required: false,
    },
  },

  emits: ['first', 'prev', 'next', 'last', 'set-page'],
});
</script>

<style scoped>
.pageSelect {
  max-width: 60px;
}
</style>

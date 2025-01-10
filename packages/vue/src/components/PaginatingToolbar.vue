<template>
  <v-toolbar dense>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    &nbsp;&nbsp; {{ subtitle }}
    <v-spacer></v-spacer>
    <v-btn v-on:click="() => $emit('first')" text icon color="secondary" v-bind:disabled="page == 1">
      <v-icon>mdi-page-first</v-icon>
    </v-btn>
    <v-btn v-on:click="() => $emit('prev')" text icon color="secondary" v-bind:disabled="page == 1">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-select
      v-bind:items="pages"
      v-on:change="() => $emit('set-page', page)"
      v-model="page"
      class="pageSelect"
    ></v-select>
    <v-btn v-on:click="() => $emit('next')" text icon color="secondary" v-bind:disabled="page == pages.length">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
    <v-btn v-on:click="() => $emit('last')" text icon color="secondary" v-bind:disabled="page == pages.length">
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

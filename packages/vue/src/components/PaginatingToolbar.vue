<template>
  <v-toolbar dense>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    &nbsp;&nbsp; {{ subtitle }}
    <v-spacer></v-spacer>
    <v-btn v-on:click="() => $emit('first')" flat icon color="secondary" v-bind:disabled="page == 1">
      <v-icon>first_page</v-icon>
    </v-btn>
    <v-btn v-on:click="() => $emit('prev')" flat icon color="secondary" v-bind:disabled="page == 1">
      <v-icon>chevron_left</v-icon>
    </v-btn>
    <v-select
      v-bind:items="pages"
      v-on:change="() => $emit('set-page', page)"
      v-model="page"
      class="pageSelect"
    ></v-select>
    <v-btn v-on:click="() => $emit('next')" flat icon color="secondary" v-bind:disabled="page == pages.length">
      <v-icon>chevron_right</v-icon>
    </v-btn>
    <v-btn v-on:click="() => $emit('last')" flat icon color="secondary" v-bind:disabled="page == pages.length">
      <v-icon>last_page</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import SkldrVue from '@/SkldrVue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PaginatingToolbar extends SkldrVue {
  @Prop({ required: true }) private pages: number[] = [];
  @Prop({ required: true }) private page: number = 1;

  @Prop({ required: false }) private title: string = '';
  @Prop({ required: false }) private subtitle: string = '';
}
</script>

<style scoped>
.pageSelect {
  max-width: 60px;
}
</style>

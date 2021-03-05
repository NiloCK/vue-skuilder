<template>
  <v-layout column wrap align-center justify-center>
    <div class="subheading pa-2">
      <v-btn v-if="spinner" @click="decrementView" icon color="accent">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      {{ views[viewIndex].name }}
      <v-btn v-if="spinner" @click="incrementView" icon color="accent">
        <v-icon alt="Hello">chevron_right</v-icon>
      </v-btn>
    </div>
    <br /><br />
    <CardViewer :view="views[viewIndex]" :data="data" />
  </v-layout>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Vue from 'vue';
import SkldrVue from '@/SkldrVue';
import Viewable from '@/base-course/Viewable';
import CardViewer from '@/components/Study/CardViewer.vue';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';

@Component({
  components: {
    CardViewer,
  },
})
export default class CardBrowser extends SkldrVue {
  @Prop() public views: Array<VueConstructor<Viewable>>;
  @Prop() public data: ViewData[];
  public viewIndex: number = 0;
  public get spinner(): boolean {
    return this.views.length > 1;
  }

  private created() {
    log(`Card browser created. Cards now in 'prewviewMode'`);
    this.$store.state.cardPreviewMode = true;
  }
  private destroyed() {
    log(`Card browser destroyed. Cards no longer in 'prewviewMode'`);
    this.$store.state.cardPreviewMode = false;
  }

  private incrementView() {
    this.viewIndex++;
    this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
  }
  private decrementView() {
    this.viewIndex--;
    this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
  }
}
</script>

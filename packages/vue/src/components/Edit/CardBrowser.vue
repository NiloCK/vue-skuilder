<template>
  <v-row column align="center" justify="center">
    <CardViewer :view="views[viewIndex]" :data="data" :course_id="'[browsing]'" :card_id="'[browsing]'" />
    <br /><br />
    <div class="text-subtitle-1 pa-2">
      <v-btn v-if="spinner" @click="decrementView" icon color="accent">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      {{ views[viewIndex].name }}
      <v-btn v-if="spinner" @click="incrementView" icon color="accent">
        <v-icon alt="Hello">chevron_right</v-icon>
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import { ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable from '@/base-course/Viewable';
import CardViewer from '@/components/Study/CardViewer.vue';
import { defineComponent, PropType } from 'vue';
import { VueConstructor } from 'vue';

export default defineComponent({
  name: 'CardBrowser',
  
  components: {
    CardViewer,
  },

  props: {
    views: {
      type: Array as PropType<Array<VueConstructor<Viewable>>>,
      required: true
    },
    data: {
      type: Array as PropType<ViewData[]>,
      required: true
    }
  },

  data() {
    return {
      viewIndex: 0
    }
  },

  computed: {
    spinner(): boolean {
      return this.views.length > 1;
    }
  },

  created() {
    console.log(`[CardBrowser] Card browser created. Cards now in 'prewviewMode'`);
    this.$store.state.cardPreviewMode = true;
  },

  destroyed() {
    console.log(`[CardBrowser] Card browser destroyed. Cards no longer in 'prewviewMode'`);
    this.$store.state.cardPreviewMode = false;
  },

  methods: {
    incrementView() {
      this.viewIndex++;
      this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
    },
    
    decrementView() {
      this.viewIndex--;
      this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
    }
  }
});
</script>

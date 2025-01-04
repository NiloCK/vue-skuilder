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
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import type { ViewData } from '@/base-course/Interfaces/ViewData';
import type Viewable from '@/base-course/Viewable';
import CardViewer from '@/components/Study/CardViewer.vue';
import type { VueConstructor } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'CardBrowser',
  components: {
    CardViewer,
  },
  props: {
    views: {
      type: Array as () => Array<VueConstructor<Viewable>>,
      required: true
    },
    data: {
      type: Array as () => ViewData[],
      required: true
    }
  },
  setup(props) {
    const { log } = SkldrComposable();
    const viewIndex = ref(0);
    
    const spinner = computed(() => props.views.length > 1);

    const incrementView = () => {
      viewIndex.value++;
      viewIndex.value = (viewIndex.value + props.views.length) % props.views.length;
    };

    const decrementView = () => {
      viewIndex.value--;
      viewIndex.value = (viewIndex.value + props.views.length) % props.views.length;
    };

    onMounted(() => {
      log(`Card browser created. Cards now in 'prewviewMode'`);
      // Note: Direct store mutation should be avoided in Vue 3
      // Consider using a mutation instead
      window.$store.state.cardPreviewMode = true;
    });

    onUnmounted(() => {
      log(`Card browser destroyed. Cards no longer in 'prewviewMode'`);
      window.$store.state.cardPreviewMode = false;
    });

    return {
      viewIndex,
      spinner,
      incrementView,
      decrementView
    };
  }
});
</script>

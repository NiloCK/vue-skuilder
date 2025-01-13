<template>
  <card-viewer
    class="ma-2"
    v-if="!loading"
    v-bind:class="loading ? 'muted' : ''"
    v-bind:view="view"
    v-bind:data="data"
    v-bind:card_id="cardID"
    v-bind:course_id="courseID"
    v-bind:sessionOrder="sessionOrder"
    v-on:emitResponse="processResponse($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Courses from '@/courses';
import { displayableDataToViewData, ViewData } from '@/base-course/Interfaces/ViewData';
import { CardData, CardRecord, DisplayableData } from '@/db/types';
import { log } from 'util';
import CardViewer from './CardViewer.vue';
import { getCourseDoc } from '@/db';
import { ViewComponent } from '@/base-course/Displayable';

export default defineComponent({
  name: 'CardLoader',

  components: {
    CardViewer,
  },

  props: {
    sessionOrder: {
      type: Number,
      required: false,
      default: 0,
    },
    qualified_id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      view: null as ViewComponent | null,
      data: [] as ViewData[],
      courseID: '',
      cardID: '',
    };
  },

  methods: {
    processResponse(r: CardRecord) {
      log(`
        Card was displayed at ${r.timeStamp}
        User spent ${r.timeSpent} milliseconds with the card.
      `);
      this.$emit('emitResponse', r);
    },

    async loadCard() {
      const qualified_id = this.qualified_id;
      console.log(`Card Loader displaying: ${qualified_id}`);

      this.loading = true;
      const _courseID = qualified_id.split('-')[0];
      const _cardID = qualified_id.split('-')[1];

      try {
        const tmpCardData = await getCourseDoc<CardData>(_courseID, _cardID);
        const tmpView = Courses.getView(tmpCardData.id_view);
        const tmpDataDocs = tmpCardData.id_displayable_data.map((id) => {
          return getCourseDoc<DisplayableData>(_courseID, id, {
            attachments: true,
            binary: true,
          });
        });

        const tmpData = [];

        for (const docPromise of tmpDataDocs) {
          const doc = await docPromise;
          tmpData.unshift(displayableDataToViewData(doc));
        }

        this.data = tmpData;
        this.view = tmpView as ViewComponent;
        this.cardID = _cardID;
        this.courseID = _courseID;
      } catch (e) {
        throw new Error(`[CardLoader] Error loading card: ${JSON.stringify(e)}, ${e}`);
      } finally {
        this.loading = false;
        this.$emit('card-loaded');
      }
    },
  },

  created() {
    this.loadCard();
  },
});
</script>

<style scoped>
.cardView {
  padding: 15px;
  border-radius: 8px;
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<template>
  <card-viewer
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
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';
import { displayableDataToViewData, ViewData } from '@/base-course/Interfaces/ViewData';
import { CardData, CardRecord, DisplayableData } from '@/db/types';
import { log } from 'util';
import SkldrVue from '@/SkldrVue';
import CardViewer from './CardViewer.vue';
import { getCourseDoc } from '@/db';

@Component({
  components: {
    CardViewer,
  },
})
export default class CardLoader extends SkldrVue {
  @Prop({
    required: false,
    default: 0,
  })
  public sessionOrder: number;
  @Prop({
    required: true,
  })
  public qualified_id: PouchDB.Core.DocumentId;

  private loading: boolean = true;

  // props for cardViewer
  private view: VueConstructor<Viewable>;
  private data: ViewData[] = [];
  private constructedView: Viewable;
  private courseID: string = '';
  private cardID: string = '';

  @Emit('emitResponse')
  private processResponse(r: CardRecord) {
    log(`
        Card was displayed at ${r.timeStamp}
        User spent ${r.timeSpent} milliseconds with the card.
        `);
  }

  // @Watch('qualified_id')
  private async created() {
    const qualified_id = this.qualified_id;
    this.log(`Card Loader displaying: ${qualified_id}`);

    this.loading = true;
    const _courseID = qualified_id.split('-')[0];
    const _cardID = qualified_id.split('-')[1];

    try {
      // const tmpCardData = await CardCache.getDoc<CardData>(qualified_id);
      const tmpCardData = await getCourseDoc<CardData>(_courseID, _cardID);
      const tmpView = Courses.getView(tmpCardData.id_view);
      const tmpDataDocs = tmpCardData.id_displayable_data.map(id => {
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
      this.view = tmpView as VueConstructor<Viewable>;
      this.cardID = _cardID;
      this.courseID = _courseID;

      // bleeding memory? Do these get GCd?
      this.constructedView = new this.view(); // [ ] remove? does this do anything?
    } catch (e) {
      throw new Error(`Error loading card: ${JSON.stringify(e)}, ${e}`);
    } finally {
      this.loading = false;
      this.$emit('card-loaded');
    }
  }
}
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

<template>
  <v-card v-if="!updatePending">
    <v-toolbar dense>
      <v-toolbar-title>Exercises</v-toolbar-title>
      <v-spacer></v-spacer>
      {{ questionCount }}
    </v-toolbar>
    <v-list two-line dense>
      <template v-for="c in cards">
        <v-list-tile
          v-bind:key="c"
          v-bind:class="selectedCard == c ? 'elevation-4 font-weight-black teal lighten-5' : ''"
        >
          <v-list-tile-content>
            <!-- <card-viewer v-if="selectedCard === c" /> -->
            <template>
              <v-list-tile-title>
                {{ cardPreview[c] }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ c.split('-').length === 3 ? c.split('-')[2] : '' }}
              </v-list-tile-sub-title>
            </template>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon v-on:click="selectedCard = selectedCard == c ? '' : c">
              <v-icon v-if="selectedCard !== c">open_in_full</v-icon>
              <v-icon v-else>close</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <!-- <transition name="component-scale" mode="out-in" v-bind:key="c"> -->
        <card-loader v-bind:key="c" v-if="selectedCard === c" v-bind:qualified_id="c" />
        <!-- </transition> -->
      </template>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import CardLoader from '@/components/Study/CardLoader.vue';
import Courses from '@/courses';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { getCourseDB, getCourseDoc, getCourseDocs } from '../../db';
import { CourseDB, getTag } from '../../db/courseDB';
import { CardData, DisplayableData, DocType, Tag } from '../../db/types';
import SkldrVue from '../../SkldrVue';

@Component({
  components: {
    CardLoader,
  },
})
export default class CourseCardBrowser extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  @Prop({ required: false }) private _tag: string;

  private courseDB: CourseDB;

  private cards: string[] = [];
  private cardData: { [card: string]: string[] } = {};
  private cardPreview: { [card: string]: string } = {};
  private selectedCard: string = '';

  private updatePending: boolean = true;

  public userIsRegistered: boolean = false;
  private questionCount: number;
  private tags: Tag[] = [];

  private async created() {
    this.courseDB = new CourseDB(this._id);

    this.questionCount = (
      await getCourseDB(this._id).find({
        selector: {
          docType: DocType.CARD,
        },
        limit: 1000,
      })
    ).docs.length;

    this.cards = await this.courseDB.getCardsByEloLimits();

    const hydratedCardData = (
      await getCourseDocs<CardData>(
        this._id,
        this.cards.map((c) => c.split('-')[1]),
        {
          include_docs: true,
        }
      )
    ).rows.map((r) => r.doc!);

    hydratedCardData.forEach((c) => {
      this.cardData[c._id] = c.id_displayable_data;
    });

    this.cards.forEach(async (c) => {
      // console.log(`generating preview for ${c}`);
      const _courseID: string = c.split('-')[0];
      const _cardID: string = c.split('-')[1];

      const tmpCardData = hydratedCardData.find((c) => c._id == _cardID)!;
      const tmpView = Courses.getView(tmpCardData.id_view);

      // todo 143 / perf: this fetch is non-blocking, but is making a db
      // query for each card. much much better to batch query by allDocs
      // with keys list
      const tmpDataDocs = tmpCardData.id_displayable_data.map((id) => {
        return getCourseDoc<DisplayableData>(_courseID, id, {
          attachments: false,
          binary: true,
        });
      });

      const allDocs = await Promise.all(tmpDataDocs);
      await Promise.all(
        allDocs.map((doc) => {
          const tmpData = [];
          tmpData.unshift(displayableDataToViewData(doc));

          const view = new tmpView();
          (view as any).data = tmpData;

          this.cardPreview[c] = view.toString();
        })
      );

      this.updatePending = false;
      this.$forceUpdate();
    });
  }
}
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.5s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.component-scale-enter-active,
.component-scale-leave-active {
  max-height: auto;
  transform: scale(1, 1);
  transform-origin: top;
  transition: transform 0.3s ease, max-height 0.3s ease;
}
.component-scale-enter,
.component-fade-leave-to {
  max-height: 0px;
  transform: scale(1, 0);
  overflow: hidden;
}
</style>

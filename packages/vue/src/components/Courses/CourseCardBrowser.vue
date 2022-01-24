<template>
  <v-card v-if="!updatePending">
    <v-toolbar dense>
      <v-toolbar-title>Exercises</v-toolbar-title>
      <v-spacer></v-spacer>
      {{ questionCount }}
    </v-toolbar>
    <v-list v-for="c in cards" v-bind:key="c.id" v-bind:class="c.isOpen ? 'blue-grey lighten-5' : ''" two-line dense>
      <v-list-tile v-bind:class="c.isOpen ? 'elevation-4 font-weight-black blue-grey lighten-4' : ''">
        <v-list-tile-content>
          <template>
            <v-list-tile-title v-bind:class="c.isOpen ? 'blue-grey--text text--lighten-4' : ''">
              {{ cardPreview[c.id] }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{ c.id.split('-').length === 3 ? c.id.split('-')[2] : '' }}
            </v-list-tile-sub-title>
          </template>
        </v-list-tile-content>
        <!-- <v-list-tile-action> -->
        <v-speed-dial v-model="c.isOpen" direction="left" transition="slide-x-reverse-transition">
          <v-btn v-on:click="clearSelections(c.id)" slot="activator" color="disabled" icon fab small v-model="c.isOpen">
            <v-icon disabled>open_in_full</v-icon>
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn
            fab
            small
            :outline="editMode != 'tags'"
            :dark="editMode == 'tags'"
            :color="editMode === 'tags' ? 'teal' : 'teal darken-3'"
            @click.stop="editMode = 'tags'"
          >
            <v-icon>bookmark</v-icon>
          </v-btn>
          <v-btn
            fab
            small
            :outline="editMode != 'flag'"
            :dark="editMode == 'flag'"
            :color="editMode === 'flag' ? 'error' : 'error darken-3'"
            @click.stop="editMode = 'flag'"
          >
            <v-icon>flag</v-icon>
          </v-btn>
        </v-speed-dial>
        <!-- </v-list-tile-action> -->
      </v-list-tile>
      <!-- <transition name="component-scale" mode="out-in"> -->
      <card-loader class="blue-grey lighten-5 elevation-1" v-if="c.isOpen" v-bind:qualified_id="c.id" />
      <!-- </transition> -->
      <tags-input
        class="ma-3"
        v-show="c.isOpen && editMode === 'tags'"
        v-bind:courseID="_id"
        v-bind:cardID="c.id.split('-')[1]"
      />
      <div class="ma-3" v-show="c.isOpen && editMode === 'flag'">
        <v-btn outline color="error" v-on:click="delBtn = true">Delete this card</v-btn>
        <span v-if="delBtn">
          <span>Are you sure?</span>
          <v-btn color="error" v-on:click="deleteCard(c.id)">Confirm</v-btn>
        </span>
      </div>
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
import TagsInput from '@/components/Edit/TagsInput.vue';

@Component({
  components: {
    CardLoader,
    TagsInput,
  },
})
export default class CourseCardBrowser extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  @Prop({ required: false }) private _tag: string;

  private courseDB: CourseDB;

  private cards: { id: string; isOpen: boolean }[] = [];
  private cardData: { [card: string]: string[] } = {};
  private cardPreview: { [card: string]: string } = {};

  private editMode: 'tags' | 'flag' | 'none' = 'none';
  private delBtn: boolean = false;

  private clearSelections(exception: string = '') {
    this.cards.forEach((card) => {
      if (card.id !== exception) {
        card.isOpen = false;
      }
    });
    this.editMode = 'none';
    this.delBtn = false;
  }

  private async deleteCard(c: string) {
    const res = await this.courseDB.removeCard(c.split('-')[1]);
    if (res.ok) {
      this.cards = this.cards.filter((card) => card.id != c);
      this.clearSelections();
    }
  }

  private updatePending: boolean = true;

  public userIsRegistered: boolean = false;
  private questionCount: number;
  private tags: Tag[] = []; // for filtering-by

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

    if (this._tag) {
      const tag = await getTag(this._id, this._tag);
      this.cards = tag.taggedCards.map((c) => {
        return { id: `${this._id}-${c}`, isOpen: false };
      });
    } else {
      this.cards = (await this.courseDB.getCardsByEloLimits()).map((c) => {
        return {
          id: c,
          isOpen: false,
        };
      });
    }

    console.log(this.cards);

    const hydratedCardData = (
      await getCourseDocs<CardData>(
        this._id,
        this.cards.map((c) => c.id.split('-')[1]),
        {
          include_docs: true,
        }
      )
    ).rows.map((r) => r.doc!);
    console.log(JSON.stringify(hydratedCardData));

    hydratedCardData.forEach((c) => {
      this.cardData[c._id] = c.id_displayable_data;
    });

    this.cards.forEach(async (c) => {
      // console.log(`generating preview for ${c}`);
      const _courseID: string = c.id.split('-')[0];
      const _cardID: string = c.id.split('-')[1];

      const tmpCardData = hydratedCardData.find((c) => c._id == _cardID)!;
      // console.log(`tmpCardData: ${JSON.stringify(tmpCardData)}`);
      const tmpView = Courses.getView(tmpCardData.id_view || 'default.question.BlanksCard.FillInView');

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

          this.cardPreview[c.id] = view.toString();
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

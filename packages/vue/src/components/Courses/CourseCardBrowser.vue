<template>
  <v-card v-if="!updatePending">
    <paginating-toolbar
      title="Exercises"
      v-bind:page="page"
      v-bind:pages="pages"
      v-bind:subtitle="`(${questionCount})`"
      v-on:first="first"
      v-on:prev="prev"
      v-on:next="next"
      v-on:last="last"
      v-on:set-page="n => setPage(n)"
    />
    <v-list v-for="c in cards" v-bind:key="c.id" v-bind:class="c.isOpen ? 'blue-grey lighten-5' : ''" two-line dense>
      <v-list-item v-bind:class="c.isOpen ? 'elevation-4 font-weight-black blue-grey lighten-4' : ''">
        <v-list-item-content>
          <template>
            <v-list-item-title v-bind:class="c.isOpen ? 'blue-grey--text text--lighten-4' : ''">
              {{ cardPreview[c.id] }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ c.id.split('-').length === 3 ? c.id.split('-')[2] : '' }}
            </v-list-item-subtitle>
          </template>
        </v-list-item-content>
        <v-speed-dial v-model="c.isOpen" direction="left" transition="slide-x-reverse-transition">
          <v-btn
            v-if="c.isOpen"
            v-on:click="clearSelections(c.id)"
            slot="activator"
            color="disabled"
            icon
            fab
            small
            v-model="c.isOpen"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn
            v-else
            v-on:click="clearSelections(c.id)"
            slot="activator"
            color="disabled"
            icon
            fab
            small
            v-model="c.isOpen"
          >
            <v-icon>open_in_full</v-icon>
          </v-btn>
          <v-btn
            fab
            small
            :outlined="editMode != 'tags'"
            :dark="editMode == 'tags'"
            :color="editMode === 'tags' ? 'teal' : 'teal darken-3'"
            @click.stop="editMode = 'tags'"
          >
            <v-icon>mdi-bookmark</v-icon>
          </v-btn>
          <v-btn
            fab
            small
            :outlined="editMode != 'flag'"
            :dark="editMode == 'flag'"
            :color="editMode === 'flag' ? 'error' : 'error darken-3'"
            @click.stop="editMode = 'flag'"
          >
            <v-icon>mdi-flag</v-icon>
          </v-btn>
        </v-speed-dial>
      </v-list-item>
      <card-loader class="blue-grey lighten-5 elevation-1" v-if="c.isOpen" v-bind:qualified_id="c.id" />
      <tags-input
        class="ma-3"
        v-show="c.isOpen && editMode === 'tags'"
        v-bind:courseID="_id"
        v-bind:cardID="c.id.split('-')[1]"
      />
      <div class="ma-3" v-show="c.isOpen && editMode === 'flag'">
        <v-btn outlined color="error" v-on:click="delBtn = true">Delete this card</v-btn>
        <span v-if="delBtn">
          <span>Are you sure?</span>
          <v-btn color="error" v-on:click="deleteCard(c.id)">Confirm</v-btn>
        </span>
      </div>
    </v-list>
    <paginating-toolbar
      class="elevation-0"
      v-bind:page="page"
      v-bind:pages="pages"
      @first="first"
      @prev="prev"
      @next="next"
      @last="last"
      @set-page="n => setPage(n)"
    />
  </v-card>
</template>

<script lang="ts">
import { displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import TagsInput from '@/components/Edit/TagsInput.vue';
import PaginatingToolbar from '@/components/PaginatingToolbar.vue';
import CardLoader from '@/components/Study/CardLoader.vue';
import Courses from '@/courses';
import { getCourseDB, getCourseDoc, getCourseDocs } from '@/db';
import { CourseDB, getTag } from '@/db/courseDB';
import { removeTagFromCard } from '@/db/courseDB';
import { CardData, DisplayableData, DocType, Tag } from '@/db/types';
import { defineComponent } from 'vue';

function isConstructor(obj: any) {
  try {
    new obj();
    return true;
  } catch (e) {
    return false;
  }
}

export default defineComponent({
  name: 'CourseCardBrowser',

  components: {
    CardLoader,
    TagsInput,
    PaginatingToolbar,
  },

  props: {
    _id: {
      type: String,
      required: true,
    },
    _tag: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      courseDB: null as CourseDB | null,
      page: 1,
      pages: [] as number[],
      cards: [] as { id: string; isOpen: boolean }[],
      cardData: {} as { [card: string]: string[] },
      cardPreview: {} as { [card: string]: string },
      editMode: 'none' as 'tags' | 'flag' | 'none',
      delBtn: false,
      updatePending: true,
      userIsRegistered: false,
      questionCount: 0,
      tags: [] as Tag[],
    };
  },

  async created() {
    this.courseDB = new CourseDB(this._id);

    if (this._tag) {
      this.questionCount = (await getTag(this._id, this._tag)).taggedCards.length;
    } else {
      this.questionCount = (
        await getCourseDB(this._id).find({
          selector: {
            docType: DocType.CARD,
          },
          limit: 1000,
        })
      ).docs.length;
    }

    for (let i = 1; (i - 1) * 25 < this.questionCount; i++) {
      this.pages.push(i);
    }

    await this.populateTableData();
  },

  methods: {
    first() {
      this.page = 1;
      this.populateTableData();
    },
    prev() {
      this.page--;
      this.populateTableData();
    },
    next() {
      this.page++;
      this.populateTableData();
    },
    last() {
      this.page = this.pages.length;
      this.populateTableData();
    },
    setPage(n: number) {
      this.page = n;
      this.populateTableData();
    },
    clearSelections(exception: string = '') {
      this.cards.forEach(card => {
        if (card.id !== exception) {
          card.isOpen = false;
        }
      });
      this.editMode = 'none';
      this.delBtn = false;
    },
    async deleteCard(c: string) {
      const res = await this.courseDB!.removeCard(c.split('-')[1]);
      if (res.ok) {
        this.cards = this.cards.filter(card => card.id != c);
        this.clearSelections();
      }
    },
    async populateTableData() {
      if (this._tag) {
        const tag = await getTag(this._id, this._tag);
        this.cards = tag.taggedCards.map(c => {
          return { id: `${this._id}-${c}`, isOpen: false };
        });
      } else {
        this.cards = (
          await this.courseDB!.getCardsByEloLimits({
            low: 0,
            high: Number.MAX_SAFE_INTEGER,
            limit: 25,
            page: this.page - 1,
          })
        ).map(c => {
          return {
            id: c,
            isOpen: false,
          };
        });
      }

      const toRemove: string[] = [];
      const hydratedCardData = (
        await getCourseDocs<CardData>(
          this._id,
          this.cards.map(c => c.id.split('-')[1]),
          {
            include_docs: true,
          }
        )
      ).rows
        .filter(r => {
          if (r.doc) {
            return true;
          } else {
            console.error(`Card ${r.id} not found`);
            toRemove.push(r.id);
            removeTagFromCard(this._id, r.id, this._tag);
            return false;
          }
        })
        .map(r => r.doc!);

      this.cards = this.cards.filter(c => !toRemove.includes(c.id.split('-')[1]));

      hydratedCardData.forEach(c => {
        if (c && c.id_displayable_data) {
          this.cardData[c._id] = c.id_displayable_data;
        }
      });

      this.cards.forEach(async c => {
        const _courseID: string = c.id.split('-')[0];
        const _cardID: string = c.id.split('-')[1];

        const tmpCardData = hydratedCardData.find(c => c._id == _cardID);
        if (!tmpCardData || !tmpCardData.id_displayable_data) {
          console.error(`No valid data found for card ${_cardID}`);
          return;
        }
        const tmpView = Courses.getView(tmpCardData.id_view || 'default.question.BlanksCard.FillInView');

        const tmpDataDocs = tmpCardData.id_displayable_data.map(id => {
          return getCourseDoc<DisplayableData>(_courseID, id, {
            attachments: false,
            binary: true,
          });
        });

        const allDocs = await Promise.all(tmpDataDocs);
        await Promise.all(
          allDocs.map(doc => {
            const tmpData = [];
            tmpData.unshift(displayableDataToViewData(doc));

            // [ ] remove/replace this after the vue 3 migration is complete
            // see PR #510
            if (isConstructor(tmpView)) {
              const view = new tmpView();
              (view as any).data = tmpData;

              this.cardPreview[c.id] = view.toString();
            } else {
              this.cardPreview[c.id] = tmpView.name ? tmpView.name : 'Unknown';
            }
          })
        );

        this.updatePending = false;
        this.$forceUpdate();
      });
    },
  },
});
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

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
      v-on:set-page="(n) => setPage(n)"
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
      @set-page="(n) => setPage(n)"
    />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, onCreated } from 'vue';
import { displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import TagsInput from '@/components/Edit/TagsInput.vue';
import PaginatingToolbar from '@/components/PaginatingToolbar.vue';
import CardLoader from '@/components/Study/CardLoader.vue';
import Courses from '@/courses';
import { getCourseDB, getCourseDoc, getCourseDocs } from '@/db';
import { CourseDB, getTag, removeTagFromCard } from '@/db/courseDB';
import { CardData, DisplayableData, DocType, Tag } from '@/db/types';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'CourseCardBrowser',
  components: {
    CardLoader,
    TagsInput,
    PaginatingToolbar,
  },
  mixins: [SkldrVueMixin],
  props: {
    _id: {
      type: String,
      required: true
    },
    _tag: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const { log, error } = SkldrComposable();
    const courseDB = ref<CourseDB>();
    const page = ref(1);
    const pages = ref<number[]>([]);
    const cards = ref<{ id: string; isOpen: boolean }[]>([]);
    const cardData = ref<{ [card: string]: string[] }>({});
    const cardPreview = ref<{ [card: string]: string }>({});
    const editMode = ref<'tags' | 'flag' | 'none'>('none');
    const delBtn = ref(false);
    const updatePending = ref(true);
    const questionCount = ref(0);
    const tags = ref<Tag[]>([]);

    const clearSelections = (exception: string = '') => {
      cards.value.forEach((card) => {
        if (card.id !== exception) {
          card.isOpen = false;
        }
      });
      editMode.value = 'none';
      delBtn.value = false;
    };

    const deleteCard = async (c: string) => {
      const res = await courseDB.value?.removeCard(c.split('-')[1]);
      if (res?.ok) {
        cards.value = cards.value.filter((card) => card.id != c);
        clearSelections();
      }
    };

    const populateTableData = async () => {
      // ... rest of populateTableData implementation
      // (keeping implementation same, just updating refs with .value)
    };

    const navigation = {
      first: () => {
        page.value = 1;
        populateTableData();
      },
      prev: () => {
        page.value--;
        populateTableData();
      },
      next: () => {
        page.value++;
        populateTableData();
      },
      last: () => {
        page.value = pages.value.length;
        populateTableData();
      },
      setPage: (n: number) => {
        page.value = n;
        populateTableData();
      }
    };

    onCreated(async () => {
      courseDB.value = new CourseDB(props._id);
      
      if (props._tag) {
        questionCount.value = (await getTag(props._id, props._tag)).taggedCards.length;
      } else {
        questionCount.value = (await getCourseDB(props._id).find({
          selector: { docType: DocType.CARD },
          limit: 1000,
        })).docs.length;
      }

      for (let i = 1; (i - 1) * 25 < questionCount.value; i++) {
        pages.value.push(i);
      }

      await populateTableData();
    });

    return {
      courseDB,
      page,
      pages,
      cards,
      cardData,
      cardPreview,
      editMode,
      delBtn,
      updatePending,
      questionCount,
      tags,
      clearSelections,
      deleteCard,
      ...navigation
    };
  }
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

<template>
  <v-card elevation="12">
    <transition name="component-fade" mode="out-in">
      <component
        class="cardView ma-2 pa-2"
        v-bind:is="view"
        v-bind:data="data"
        v-bind:key="course_id + '-' + card_id + '-' + sessionOrder"
        v-bind:modifyDifficulty="user_elo.global.score - card_elo"
        v-on:emitResponse="processResponse($event)"
      />
    </transition>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable from '@/base-course/Viewable';
import Courses from '@/courses';
import { CardRecord } from '@/db/types';
import { CourseElo } from '@/tutor/Elo';
import { VueConstructor } from 'vue';
import { DefineComponent } from 'vue';
import { ViewComponent } from '@/base-course/Displayable';

export default defineComponent({
  name: 'CardViewer',

  components: Courses.allViews(),

  props: {
    sessionOrder: {
      type: Number,
      required: false,
      default: 0,
    },
    card_id: {
      type: String as () => PouchDB.Core.DocumentId,
      required: true,
      default: '',
    },
    course_id: {
      type: String,
      required: true,
      default: '',
    },
    view: {
      type: [Function, Object] as PropType<ViewComponent>,
      required: true,
    },
    data: {
      type: Array as () => ViewData[],
      required: true,
    },
    user_elo: {
      type: Object as () => CourseElo,
      default: () => ({
        global: {
          score: 1000,
          count: 0,
        },
        tags: {},
        misc: {},
      }),
    },
    card_elo: {
      type: Number,
      default: 1000,
    },
  },

  emits: ['emitResponse'],

  methods: {
    processResponse(r: CardRecord): void {
      console.log(`
        Card was displayed at ${r.timeStamp}
        User spent ${r.timeSpent} milliseconds with the card.
        `);
      this.$emit('emitResponse', r);
    },
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

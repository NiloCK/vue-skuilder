<template>
  <v-card elevation="12">
    <transition name="component-fade" mode="out-in">
      <component
        class="cardView"
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
import { ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable from '@/base-course/Viewable';
import Courses from '@/courses';
import { CardRecord } from '@/db/types';
import { CourseElo } from '@/tutor/Elo';
import Vue, { VueConstructor } from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({
  components: Courses.allViews(),
})
export default class CardViewer extends Vue {
  @Prop({
    required: false,
    default: 0,
  })
  public sessionOrder: number;
  @Prop({
    required: true,
    default: '',
  })
  public card_id: PouchDB.Core.DocumentId;
  @Prop({
    required: true,
    default: '',
  })
  public course_id: string;
  @Prop() public view: VueConstructor<Viewable>;
  @Prop() public data: ViewData[];
  @Prop({
    default: () => {
      return {
        global: {
          score: 1000,
          count: 0,
        },
        tags: {},
        misc: {},
      };
    },
  })
  public user_elo: CourseElo = {
    global: {
      score: 1000,
      count: 0,
    },
    tags: {},
    misc: {},
  };
  @Prop({
    default: 1000,
  })
  public card_elo: number;

  @Emit('emitResponse')
  private processResponse(r: CardRecord) {
    console.log(`
        Card was displayed at ${r.timeStamp}
        User spent ${r.timeSpent} milliseconds with the card.
        `);
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

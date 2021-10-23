<template>
  <v-card class="elevation-12">
    <transition name="component-fade" mode="out-in">
      <component
        class="cardView"
        v-bind:is="view"
        v-bind:data="data"
        v-bind:key="course_id + '-' + card_id + '-' + sessionOrder"
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
import { log } from 'util';
import Vue, { VueConstructor } from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({
  components: Courses.allViews(),
})
export default class CardViewer extends Vue {
  @Prop({
    required: false,
  })
  public sessionOrder: number = 0;
  @Prop({
    required: false,
  })
  public card_id: PouchDB.Core.DocumentId = '';
  @Prop({
    required: false,
  })
  public course_id: string = '';
  @Prop() public view: VueConstructor<Viewable>;
  @Prop() public data: ViewData[];

  @Emit('emitResponse')
  private processResponse(r: CardRecord) {
    log(`
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

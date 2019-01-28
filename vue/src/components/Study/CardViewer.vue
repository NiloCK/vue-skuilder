<template>
    <v-card class='elevation-12'>
        <transition name='component-fade' mode='out-in'>
            <component
                class='cardView'
                :is="view"
                v-bind:data="data"
                v-bind:key="card_id + '-' + sessionOrder"
                v-on:emitResponse="processResponse($event)"
            />    
        </transition>
    </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { CardRecord } from '@/db/types';
import { log } from 'util';

@Component({
  components: Courses.allViews()
})
export default class CardViewer extends Vue {
  @Prop({
    required: false
  }) public sessionOrder: number = 0;
  @Prop({
    required: false
  }) public card_id: PouchDB.Core.DocumentId = '';
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

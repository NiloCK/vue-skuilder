<template>
    <div class='cardView'>
        <component
            :is="view"
            v-bind:data="data"
            v-on:emitResponse="processResponse($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { CardRecord } from '@/db/types';
import { log } from 'util';

@Component({
    components: Courses.allViews()
})
export default class CardViewer extends Vue {
    @Prop() public view: VueConstructor<Viewable>;
    @Prop() public data: ViewData[];

    private processResponse(r: CardRecord) {
        log(`
        Card was displayed at ${r.timeStamp}
        User spent ${r.timeSpent} milliseconds with the card.
        `);

        this.$emit('emitResponse', r);
    }
}
</script>

<style scoped>
.cardView {
  padding: 15px;
  border: 2px solid black;
  border-radius: 8px;
}
</style>

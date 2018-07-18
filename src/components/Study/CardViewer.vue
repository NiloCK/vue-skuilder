<template>
    <div>
        <component :is="view" v-bind:data="data" />        
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';
import { ViewData } from '@/base-course/Interfaces/ViewData';

@Component({
    components: Courses.allViews()
})
export default class CardViewer extends Vue {
    @Prop() public view: VueConstructor<Viewable>;
    @Prop() public data: ViewData[];
}
</script>

<style scoped>
div {
  border: solid 2px red;
}
</style>

<template>
    <div>
        <component :is="view" v-bind:data="data" />        
    </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';

@Component({
    components: Courses.allViews()
})
export default class CardViewer extends Vue {
    @Prop() public view: VueConstructor<Viewable>;
    @Prop() public data: DisplayableData;
}
// Argument of type '{ components: VueConstructor<Vue>[]; }'
// is not assignable to parameter of type 'VueClass<Vue>'.
</script>

<style scoped>
div {
  border: solid 2px red;
}
</style>

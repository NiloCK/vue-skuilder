<template>
    <div>
        <component :is="view" v-bind:data="data" />
        <br><br>
        This is a <b>{{view.name}}</b> component, with the following data: {{JSON.stringify(data)}}
    </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';
import { getViews } from '@/courses';
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import Courses from '@/courses';
import Viewable from '@/base-course/Viewable';

@Component({
    components: getViews(Courses)
})
export default class CardViewer extends Vue {
  @Prop() public view: VueConstructor<Viewable>;
  @Prop() public data: DisplayableData;
}
// Argument of type '{ components: VueConstructor<Vue>[]; }'
// is not assignable to parameter of type 'VueClass<Vue>'.
</script>

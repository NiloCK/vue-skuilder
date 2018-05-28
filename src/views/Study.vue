<template>
  <div class="Study">
    <h1>Study:</h1>
    <CardViewer
        v-bind:view="view"
        v-bind:data="data"
    />
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import Vue from 'vue';
import { DisplayableData, DocType } from '@/db/types';
import Viewable from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import CardViewer from '@/components/Study/CardViewer.vue';
import { getView } from '@/courses';
import Courses from '@/courses';

@Component({
    components: {
        CardViewer
    }
})
export default class Study extends Vue{
    public view: VueConstructor<Vue> | undefined;
    // public data: DisplayableData = {
    //     id_datashape: 'asdf',
    //     data: [
    //         {
    //             data: 7,
    //             name: 'a'
    //         },
    //         {
    //             data: 4,
    //             name: 'b'
    //         }
    //     ],
    //     course: 'math',
    //     docType: DocType.DISPLAYABLE_DATA
    // }
    public data: any = {
        a: 4,
        b: 6
    }

    created() {
        // alert('hi');
        this.view = getView(Courses, 'math.SingleDigitDivisionQuestion.DivisionHorizontal');
    }
};
</script>

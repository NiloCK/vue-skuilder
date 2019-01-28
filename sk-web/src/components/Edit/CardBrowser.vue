<template>
    <v-layout column wrap align-center justify-center>
        <div>
            <v-btn @click="decrementView" icon color="accent" >
                <v-icon>chevron_left</v-icon>
            </v-btn>
            {{ views[viewIndex].name }}
            <v-btn @click="incrementView" icon color="accent" >
                <v-icon>chevron_right</v-icon>
            </v-btn>
        </div>
        <br><br>
        <CardViewer :view='views[viewIndex]' :data='data' />
    </v-layout>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Vue from 'vue';
import Viewable from '@/base-course/Viewable';
import CardViewer from '@/components/Study/CardViewer.vue';
import { ViewData } from '@/base-course/Interfaces/ViewData';

@Component({
    components: {
        CardViewer
    }
})
export default class CardBrowser extends Vue {
    @Prop() public views: Array<VueConstructor<Viewable>>;
    @Prop() public data: ViewData[];
    public viewIndex: number = 0;

    private incrementView() {
        this.viewIndex++;
        this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
    }
    private decrementView() {
        this.viewIndex--;
        this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
    }
}
</script>

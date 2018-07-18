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
import { DisplayableData, DocType, CardData } from '@/db/types';
import Viewable from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import CardViewer from '@/components/Study/CardViewer.vue';
import Courses from '@/courses';
import { getCards, getDoc } from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';

function randInt(n: number) {
    return Math.floor(Math.random() * n);
}

@Component({
    components: {
        CardViewer
    }
})
export default class Study extends Vue {
    public view: VueConstructor<Vue>;

    public data: ViewData[] = [];

    public created() {
        this.loadRandomCard();
    }

    private loadRandomCard() {
        getCards().then((results) => {
            return results.docs[
                randInt(results.docs.length)
            ];
        }).then((doc) => {
            return getDoc<CardData>(doc._id);
        }).then((cardData) => {
            this.view = Courses.getView(cardData.id_view);
            return cardData.id_displayable_data;
        }).then((displayables) => {
            return displayables.map((id) => {
                return getDoc<DisplayableData>(id);
            });
        }).then((displayDocs) => {
            displayDocs.forEach((promiseDoc) => {
                promiseDoc.then((doc) => {
                    this.data.push(
                        displayableDataToViewData(doc)
                    );
                });
            });
        });
    }
}
</script>

<style scoped>
</style>


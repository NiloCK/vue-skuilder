<template>
  <div class="Study">
    <h1>Study:</h1>
    <CardViewer
        v-bind:view="view"
        v-bind:data="data"
        v-on:emitResponse="processResponse($event)"
    />
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import Vue from 'vue';
import { DisplayableData, DocType, CardData, CardRecord, QuestionRecord } from '@/db/types';
import Viewable from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import CardViewer from '@/components/Study/CardViewer.vue';
import Courses from '@/courses';
import { getCards, getDoc, putCardRecord } from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';

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
    private cardID: PouchDB.Core.DocumentId = '';

    public created() {
        this.loadRandomCard();
    }

    private isQuestionRecord(r: CardRecord): r is QuestionRecord {
        return (r as QuestionRecord).userAnswer !== undefined;
    }

    private processResponse(r: CardRecord) {
        r.cardID = this.cardID;
        log(`Study.processResponse is running...`);
        this.logCardRecordToDB(r);

        if (this.isQuestionRecord(r)) {
            log(`Question is ${r.isCorrect ? '' : 'in'}correct`);
            if (r.isCorrect) {
                this.loadRandomCard();
            }
        } else {
            // submit this cardRecord to the db
            this.loadRandomCard();
        }
    }

    private logCardRecordToDB(r: CardRecord) {
        putCardRecord(r);
    }

    private loadRandomCard() {
        getCards().then((results) => {
            return results.docs[
                randInt(results.docs.length)
            ];
        }).then((doc) => {
            this.cardID = doc._id;
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


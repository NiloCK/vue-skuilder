<template>
  <div class="Study">
    <h1>Study:</h1>
    <br>
    <div ref="shadowWrapper">
      <card-viewer
          v-bind:view="view"
          v-bind:data="data"
          v-bind:card_id="cardID"
          v-bind:sessionOrder="cardCount"
          v-on:emitResponse="processResponse($event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
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
  public cardID: PouchDB.Core.DocumentId = '';
  public cardCount: number = 1;

  public $refs: {
    shadowWrapper: HTMLDivElement
  };

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
        this.$refs.shadowWrapper.classList.add('correct');
        this.loadRandomCard();
      } else {
        this.$refs.shadowWrapper.classList.add('incorrect');
        // clear user input?
      }
    } else {
      this.loadRandomCard();
    }

    setTimeout(() => {
      this.$refs.shadowWrapper.classList.remove('correct', 'incorrect');
    }, 1250);
  }

  private logCardRecordToDB(r: CardRecord) {
    putCardRecord(r, this.$store.state.user);
  }

  private loadRandomCard() {
    getCards().then((results) => {
      return results.docs[
        randInt(results.docs.length)
      ];
    }).then((doc) => {
      log(`
DocID ${doc._id} has been picked...
            `);
      this.cardID = doc._id;
      this.cardCount++;
      return getDoc<CardData>(doc._id);
    }).then((cardData) => {
      this.view = Courses.getView(cardData.id_view);
      return cardData.id_displayable_data;
    }).then((displayableData) => {
      return displayableData.map((id) => {
        return getDoc<DisplayableData>(id, {
          attachments: true,
          binary: true
        });
      });
    }).then((displayDocs) => {
      displayDocs.forEach((promiseDoc) => {
        promiseDoc.then((doc) => {
          this.data.unshift(
            displayableDataToViewData(doc)
          );
          this.data = this.data.slice(0, displayDocs.length);
        });
      });
    });
  }
}
</script>

<style scoped>
.correct {
  animation: greenFade 1250ms ease-out;
}

.incorrect {
  animation: purpleFade 1250ms ease-out;
}

@keyframes greenFade {
  0% {
    box-shadow: rgba(0, 150, 0, 0.25) 0px 7px 8px -4px,
      rgba(0, 150, 0, 0.25) 0px 12px 17px 2px,
      rgba(0, 150, 0, 0.25) 0px 5px 22px 4px;
  }
  100% {
    box-shadow: rgba(0, 150, 0, 0) 0px 0px;
  }
}
@keyframes purpleFade {
  0% {
    box-shadow: rgba(115, 0, 75, 0.25) 0px 7px 8px -4px,
      rgba(115, 0, 75, 0.25) 0px 12px 17px 2px,
      rgba(115, 0, 75, 0.25) 0px 5px 22px 4px;
  }
  100% {
    box-shadow: rgba(115, 0, 75, 0) 0px 0px;
  }
}
</style>

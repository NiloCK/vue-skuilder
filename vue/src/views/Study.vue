<template>
  <div class="Study">
    <h1 class='display-1'>Study:</h1>
    <br>
    <div v-if='sessionFinished' class='display-1'>
      Session is finished!
    </div>
    <div v-else ref="shadowWrapper">
      <card-viewer
          v-bind:view="view"
          v-bind:data="data"
          v-bind:card_id="cardID"
          v-bind:sessionOrder="cardCount"
          v-on:emitResponse="processResponse($event)"
      />
    </div>
    <v-btn
      fab
      fixed
      bottom
      right
      title="Discuss this card"
    >
      <v-icon>chat_bubble_outline</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { DisplayableData, DocType, CardData, CardRecord, QuestionRecord, isQuestionRecord } from '@/db/types';
import Viewable from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import CardViewer from '@/components/Study/CardViewer.vue';
import Courses from '@/courses';
import { getActiveCards, getScheduledCards, getCards, getDoc, putCardRecord, scheduleCardReview } from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';
import { newInterval } from '@/db/SpacedRepetition';
import moment from 'moment';

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

  public readonly SessionCount: number = 10;

  public sessionFinished: boolean = false;
  public session: string[] = [];
  public activeCards: string[] = [];

  public $refs: {
    shadowWrapper: HTMLDivElement
  };

  public async created() {
    this.activeCards = await getActiveCards(this.$store.state.user);
    await this.getSessionCards();

    this.nextCard();
    // this.loadRandomCard();
  }

  /**
   * Loads the next card in the session, and removes the 
   */
  public nextCard(_id?: string) {
    if (_id) {
      this.session.splice(
        this.session.indexOf(_id),
        1
      );
    }

    if (this.session.length === 0) {
      this.sessionFinished = true;
    } else {
      this.loadCard(this.session[
        randInt(this.session.length)
      ]);
    }
  }

  private async getSessionCards() {
    // start with the review cards that are 'due'
    const dueCards = await getScheduledCards(this.$store.state.user);

    // but cut them off if they are too many for the session
    if (dueCards.length <= this.SessionCount) {
      this.session.concat(dueCards);
    } else {
      for (let index = 0; index < this.SessionCount; index++) {
        this.session.push(dueCards[index]);
      }
    }

    // # of new cards is at least one, otherwise fills half
    // of the remaining session space
    let newCardCount: number = Math.max(
      1,
      Math.ceil(
        (this.SessionCount - this.session.length) / 2
      )
    );

    const cards = await getCards();
    const cardIDs = cards.docs.map((doc) => {
      return doc._id;
    });

    const newCards = cardIDs.filter((cardID) => {
      return this.activeCards.indexOf(cardID) === -1;
    });

    while (newCardCount > 0 && newCards.length > 0) {
      const index = randInt(newCards.length);
      this.session.push(newCards.splice(index, 1)[0]);
      newCardCount--;
    }
  }

  private processResponse(r: CardRecord) {
    r.cardID = this.cardID;
    log(`Study.processResponse is running...`);
    this.logCardRecordAndScheduleReview(r);

    if (isQuestionRecord(r)) {
      log(`Question is ${r.isCorrect ? '' : 'in'}correct`);
      if (r.isCorrect) {
        this.$refs.shadowWrapper.classList.add('correct');
        if (r.priorAttemps === 0) {
          this.nextCard(r.cardID);
        } else {
          this.nextCard();
        }
        // this.loadRandomCard();
      } else {
        this.$refs.shadowWrapper.classList.add('incorrect');
        // clear user input?
      }
    } else {
      this.nextCard(r.cardID);
      // this.loadRandomCard();
    }

    setTimeout(() => {
      this.$refs.shadowWrapper.classList.remove('correct', 'incorrect');

    }, 1250);
  }

  private async logCardRecordAndScheduleReview(r: CardRecord) {
    const history = await putCardRecord(r, this.$store.state.user);
    const nextInterval = newInterval(history.records);
    const nextReviewTime = moment.utc().add(nextInterval, 'seconds');

    // todo: need to retain some state here wrt a card's being displayed
    // multiple times in a session.
    if (isQuestionRecord(r)) {
      if (r.isCorrect && r.priorAttemps === 0) {
        scheduleCardReview(this.$store.state.user, r.cardID, nextReviewTime);
      }
    } else {
      scheduleCardReview(this.$store.state.user, r.cardID, nextReviewTime);
    }
  }

  private loadCard(_id: string) {
    this.cardID = _id;
    this.cardCount++;

    getDoc<CardData>(_id).then((cardData) => {
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

  // todo: delete this
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

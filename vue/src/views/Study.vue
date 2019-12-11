<template>
  <div class="Study">
    <h1 class='display-1'>Study:
    <v-progress-circular v-if="loading"
        color="primary"
        indeterminate
        rotate="0"
        size="32"
        value="0"
        width="4"
    ></v-progress-circular>
    </h1>
    <br>
    <div v-if='sessionFinished' class='display-1'>
      All done! Great job!
    </div>
    <div v-else ref="shadowWrapper">    
      <card-viewer
          v-bind:class="loading ? 'muted' : ''"
          v-bind:view="view"
          v-bind:data="data"
          v-bind:card_id="cardID"
          v-bind:course_id="courseID"
          v-bind:sessionOrder="cardCount"
          v-on:emitResponse="processResponse($event)"
      />
    </div>
    <v-btn
      fab
      fixed
      bottom
      right
      title="Edit this card"
      @click="editCard = !editCard"
      :loading='editCard'
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <v-dialog
      v-model="editCardReady"
      scrollable fullscreen
      persistent :overlay="false"
      transition="dialog-transition"
    >
      <v-card>
        
      <data-input-form
        v-if="editCardReady"
        :course='courseID'
        
      />
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import {
  DisplayableData,
  DocType,
  CardData,
  CardRecord,
  QuestionRecord,
  isQuestionRecord,
  CardHistory
} from '@/db/types';
import Viewable from '@/base-course/Viewable';
import { Component } from 'vue-property-decorator';
import DataInputForm from '@/components/Edit/ViewableDataInputForm/DataInputForm.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import Courses from '@/courses';
import {
  getActiveCards,
  getScheduledCards,
  getRandomCards,
  getDoc,
  putCardRecord,
  scheduleCardReview,
  getCourseDoc
} from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';
import { newInterval } from '@/db/SpacedRepetition';
import moment from 'moment';
import { getUserCourses } from '../db/userDB';
import { Watch } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { getCredentialledCourseConfig, getCardDataShape } from '@/db/courseDB';
// import CardCache from '@/db/cardCache';

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

@Component({
  components: {
    CardViewer,
    DataInputForm
  }
})
export default class Study extends SkldrVue {
  public editCard: boolean = false; // open the editor for this card
  public editCardReady: boolean = false; // editor for this card is ready to display
  // the currently displayed card
  public cardID: PouchDB.Core.DocumentId = '';
  public view: VueConstructor<Vue>;
  public data: ViewData[] = [];
  public courseID: string = '';

  public cardCount: number = 1;
  public readonly SessionCount: number = 10;

  public sessionFinished: boolean = false;
  public session: string[] = [];
  public activeCards: string[] = [];

  public loading: boolean = false;

  public $refs: {
    shadowWrapper: HTMLDivElement
  };
  private userCourseIDs: string[] = [];

  @Watch('editCard')
  public async onEditToggle(value?: boolean, old?: boolean) {
    if (value) {
      this.$store.state.dataInputForm.dataShape =
        await getCardDataShape(this.courseID, this.cardID);

      const cfg = await getCredentialledCourseConfig(this.courseID);
      this.$store.state.dataInputForm.course = cfg!;

      this.editCardReady = true;

      // clear any stale data from the inputForm 'store'
      for (const oldField in this.$store.state.dataInputForm.localStore) {
        if (oldField) {
          log(`Removing old data: ${oldField}`);
          delete this.$store.state.dataInputForm.localStore[oldField];
        }
      }

      // repopulate the inputForm store w/ this card's data
      for (const field in this.data[0]) {
        if (field) {
          log(`Writing ${field}: ${this.data[0][field]} to the dataInputForm state...`);
          this.$store.state.dataInputForm.localStore[field] = this.data[0][field];
        }
      }

      // this.$store.state.dataInputForm.dataShape = this.view.question().dataShapes[0];
    } else {
      this.editCardReady = false;
    }
  }


  public async created() {
    this.activeCards = await getActiveCards(this.$store.state.user);
    this.userCourseIDs =
      (await getUserCourses(this.$store.state.user))
        .courses.map((course) => {
          return course.courseID;
        });
    await this.getSessionCards();

    log(`Session created:

${this.sessionString}`);

    this.nextCard();
  }

  private get sessionString() {
    let ret = '';
    for (const q of this.session) {
      ret += q + '\n';
    }
    return ret;
  }

  /**
   * Loads the next card in the session, and removes the
   * passed _id from session rotation (marks as complete)
   */
  public nextCard(_id?: string) {
    if (_id) {
      this.session.splice(
        this.session.indexOf(_id),
        1
      );
    }

    log(`Cards left in session:
    ${this.sessionString}
    `);

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
      this.session = this.session.concat(dueCards);
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

    const cardIDs = await getRandomCards(this.userCourseIDs);

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
    r.courseID = this.courseID;
    log(`Study.processResponse is running...`);
    const cardHistory = this.logCardRecord(r);

    if (isQuestionRecord(r)) {
      log(`Question is ${r.isCorrect ? '' : 'in'}correct`);
      if (r.isCorrect) {
        this.$refs.shadowWrapper.classList.add('correct');
        if (r.priorAttemps === 0) {
          // user got the question right on 'the first try'.
          // dismiss the card from this study session, and
          // schedule its review in the future.
          this.nextCard(r.cardID);

          cardHistory.then((history) => {
            this.scheduleReview(history);
          });
        } else {
          // user got the question right, but with multiple
          // attempts. Dismiss it, but don't remove from
          // currrent study session
          this.nextCard();
        }
      } else {
        this.$refs.shadowWrapper.classList.add('incorrect');
        // clear user input? todo: needs to be a fcn on CardViewer
      }
    } else {
      this.nextCard(r.cardID);
    }

    this.clearFeedbackShadow();
  }

  private clearFeedbackShadow() {
    setTimeout(() => {
      this.$refs.shadowWrapper.classList.remove('correct', 'incorrect');
    }, 1250);
  }

  private async logCardRecord(r: CardRecord) {
    return await putCardRecord(r, this.$store.state.user);
  }

  private async scheduleReview(history: CardHistory<CardRecord>) {
    const nextInterval = newInterval(history.records);
    const nextReviewTime = moment.utc().add(nextInterval, 'seconds');

    scheduleCardReview(
      this.$store.state.user,
      history.courseID,
      history.cardID,
      nextReviewTime
    );
  }

  /**
   * async fetch card data and view from the db
   * for the given qualified card id ("courseid-cardid"),
   * and then display the card to the user.
   */
  private async loadCard(qualified_id: string) {
    this.loading = true;
    const _courseID = qualified_id.split('-')[0];
    const _cardID = qualified_id.split('-')[1];

    try {
      // const tmpCardData = await CardCache.getDoc<CardData>(qualified_id);
      const tmpCardData = await getCourseDoc<CardData>(_courseID, _cardID);
      const tmpView = Courses.getView(tmpCardData.id_view);
      const tmpDataDocs = await tmpCardData.id_displayable_data.map((id) => {
        return getCourseDoc<DisplayableData>(_courseID, id, {
          attachments: true,
          binary: true
        });
      });

      const tmpData = [];

      for (const docPromise of tmpDataDocs) {
        const doc = await docPromise;

        tmpData.unshift(
          displayableDataToViewData(doc)
        );
      }

      this.cardCount++;
      this.data = tmpData;
      this.view = tmpView;
      this.cardID = _cardID;
      this.courseID = _courseID;

    } catch (e) {
      log(`Error loading card: ${JSON.stringify(e)}`);
      this.nextCard(qualified_id);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
/* .muted {
  opacity: 0;
} */

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

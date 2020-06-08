<template>
  <div class="Study" v-if="sessionPrepared">
    
    <v-layout v-if="previewMode">
      <span class="headline">Quilt preview for <em>{{courseConfig.name}}</em></span>
      <v-btn small @click="registerUserForPreviewCourse" color="primary">Join</v-btn>
      <router-link :to="`/quilts/${courseConfig.courseID}`"><v-btn small color="secondary">More info</v-btn></router-link>
       <v-spacer></v-spacer>
       <SkldrControlsView />
    </v-layout>
    <v-layout v-else>
      <h1  class='display-1'>Study:
        <v-progress-circular v-if="loading"
            color="primary"
            indeterminate
            rotate="0"
            size="32"
            value="0"
            width="4"
        ></v-progress-circular>
      </h1>
      <v-spacer></v-spacer>
      <SkldrControlsView />
    </v-layout>
    
    <br>

    <div v-if='!checkLoggedIn' class='display-1'>
      <p>Sign up to get to work!</p>
    </div>
   
    <div v-else-if='noRegistrations' class='display-1'>
      <p>You don't have anything to study!</p>
      <p>Head over to the <router-link to="/quilts">Quilts</router-link> page to find something for you.</p>
    </div>

    <div v-else-if='sessionFinished' class='display-1'>
      <p>Study session finished! Great job!</p>
      <p>Start <a @click="refreshRoute">another study session</a>, or try 
      <router-link :to="`/edit/${courseID}`">adding some new content</router-link> to challenge yourself and others!
      </p>
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
    <br>
    <div v-if="!sessionFinished && !noRegistrations">
      <p>Add tags to this card:</p>
      <sk-tags-input
          v-if='!sessionFinished'
          :courseID="courseID"
          :cardID="cardID"
      />
    </div>
    
    <v-bottom-nav
      v-if="!noRegistrations"
      absolute
      value="true"
    >
      <v-flex xs12
        class="headline teal darken-2 white--text text-sm-center text-align-center align-content-center align-center">
          Cards Remaining: {{ session.length }}
      </v-flex>
    </v-bottom-nav>
    <router-link
      :to='`/edit/${courseID}`'
    >
      <v-btn
        v-if="!noRegistrations"
        fab
        fixed
        dark
        bottom
        right
        color="blue darken-2"
        title="Add content to this course"
      >
        <v-icon dark>add</v-icon>
      </v-btn>
    </router-link>
    <!-- <v-speed-dial
      v-model="fab"
      fixed
      bottom
      right
      transition='scale-transition'
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="blue darken-2"
          dark
          fab
        >
          <v-icon v-if='fab'>close</v-icon>
          <v-icon v-else>edit</v-icon>
        </v-btn>
      </template>
      <router-link
      :to='`/edit/${courseID}`'
    >
      <v-btn
        fab
        small
        dark
        color='indigo'
        title="Add content to this course"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </router-link>
    <v-btn
      fab
      dark
      small
      color="orange darken-2"
      title="Edit tags on this card"
      @click="editTags = !editTags"
      :loading='editCard'
    >
      <v-icon>bookmark</v-icon>
    </v-btn> 
    
    </v-speed-dial>-->
    <br>
    
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
import Viewable, { isQuestionView } from '@/base-course/Viewable';
import { Component, Prop } from 'vue-property-decorator';
import CardViewer from '@/components/Study/CardViewer.vue';
import Courses from '@/courses';
import {
  getScheduledCards,
  getRandomCards,
  getDoc,
  putCardRecord,
  scheduleCardReview,
  getCourseDoc,
  getEloNeighborCards
} from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';
import { newInterval } from '@/db/SpacedRepetition';
import moment from 'moment';
import { getUserClassrooms, CourseRegistrationDoc, updateUserElo, User } from '../db/userDB';
import { Watch } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { getCredentialledCourseConfig, getCardDataShape, updateCardElo, getCourseList } from '@/db/courseDB';
import SkTagsInput from '@/components/Edit/TagsInput.vue';
import { StudentClassroomDB } from '../db/classroomDB';
import { alertUser } from '../components/SnackbarService.vue';
import { Status } from '../enums/Status';
import { randomInt } from '../courses/math/utility';
import { GuestUsername } from '@/store';
import { CourseConfig } from '../server/types';
import SkldrControlsView from '../components/SkMouseTrap.vue';
// import CardCache from '@/db/cardCache';

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

function randIntWeightedTowardZero(n: number) {
  return Math.floor(Math.random() * Math.random() * Math.random() * n);
}

interface StudySessionRecord {
  card: {
    course_id: string,
    card_id: string,
    card_elo: number
  },
  records: CardRecord[]
}

class EloRank {
  k: number;
  constructor(k?: number) {
    this.k = k || 32;
  }

  setKFactor(k: number) {
    this.k = k;
  }
  getKFactor() {
    return this.k;
  }

  getExpected(a: number, b: number) {
    return 1 / (1 + Math.pow(10, ((b - a) / 400)));
  }
  updateRating(expected: number, actual: number, current: number) {
    return Math.round(current + this.k * (actual - expected));
  }
}

function adjustScores(userElo: number, cardElo: number, userScore: number, k?: number): {
  userElo: number,
  cardElo: number
} {
  const elo = new EloRank(k);
  const exp = elo.getExpected(userElo, cardElo);
  const upA = elo.updateRating(exp, userScore, userElo);
  const upB = elo.updateRating(1 - exp, 1 - userScore, cardElo);

  console.log(`ELO updates w/ user score ${userScore}
       user  |  card
init   ${userElo}         ${cardElo}
final  ${upA}         ${upB}
  `)

  return {
    userElo: upA,
    cardElo: upB
  };
}

@Component({
  components: {
    CardViewer,
    SkldrControlsView,
    SkTagsInput
  }
})
export default class Study extends SkldrVue {
  @Prop()
  public previewCourseID?: string;
  @Prop()
  public randomPreview?: boolean;
  @Prop()
  public focusCourseID?: string;

  public courseConfig?: CourseConfig;
  public previewMode: boolean = false;


  public fab: boolean = false; // open the speed-dial fab
  public editTags: boolean = false; // open the tagsInput for this card
  public editCard: boolean = false; // open the editor for this card
  public editCardReady: boolean = false; // editor for this card is ready to display
  // the currently displayed card
  public cardID: PouchDB.Core.DocumentId = '';
  public view: VueConstructor<Viewable>;
  public constructedView: Viewable;
  public data: ViewData[] = [];
  public courseID: string = '';

  public cardCount: number = 1;
  public readonly SessionCount: number = 15;

  public session: string[] = [];
  public sessionPrepared: boolean = false;
  public sessionFinished: boolean = false;
  public sessionRecord: StudySessionRecord[] = [];
  public activeCards: string[] = [];

  public noRegistrations: boolean = false;

  public loading: boolean = false;
  public user: User;

  public $refs: {
    shadowWrapper: HTMLDivElement
  };
  private userCourseRegDoc: CourseRegistrationDoc;
  private userCourseIDs: string[] = [];
  private userClassroomDBs: StudentClassroomDB[] = [];


  public checkLoggedIn(): boolean {
    // return !this.$store.state._user!.username.startsWith(GuestUsername);
    return true;
  }

  @Watch('editCard')
  public async onEditToggle(value?: boolean, old?: boolean) {
    // this section was wip for editing cards w/ dataInputForm (defunct plan)
    // Refactor to a different location for future use...
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

      // this.$refs.dataInputForm.convertInput();

      // this.$store.state.dataInputForm.dataShape = this.view.question().dataShapes[0];
    } else {
      this.editCardReady = false;
    }
  }

  public handleClassroomMessage(): (v: any) => {} {
    return (v: any) => {

      alertUser({
        text: this.$store.state._user!.username,
        status: Status.ok
      })
      log(`There was a change in the classroom DB:`);
      log(`change: ${v}`);
      log(`Stringified change: ${JSON.stringify(v)}`);
      return {};
    }
  }

  public refreshRoute() {
    this.$router.go(0);
  }

  public async created() {
    this.user = this.$store.state._user!;
    this.userCourseRegDoc = await this.user.getCourseRegistrationsDoc();
    this.activeCards = await this.user.getActiveCards();

    if (this.randomPreview) {
      // set a .previewCourseID 
      const allCourses = (await getCourseList()).rows.map(r => r.id);
      log(`RANDOMPREVIEW:
      Courses:
      ${allCourses.toString()}`);
      const unRegisteredCourses = allCourses.filter(c => {
        return !this.userCourseRegDoc.courses.some((rc) => rc.courseID === c);
      });
      if (unRegisteredCourses.length > 0) {
        this.previewCourseID = unRegisteredCourses[randomInt(0, unRegisteredCourses.length)];
      } else {
        this.previewCourseID = allCourses[randomInt(0, allCourses.length)];
      }
    }

    if (this.previewCourseID) {
      this.previewMode = true;
      getCourseList().then((courses) => {
        courses.rows.forEach((c) => {
          if (c.id === this.previewCourseID) {
            this.courseConfig = c.doc!;
            this.courseConfig.courseID = c.id;
          }
        });
      });
      log(`COURSE PREVIEW MODE FOR ${this.previewCourseID}`);
      // this.activeCards = [];
      this.userCourseIDs = [this.previewCourseID];
      this.userClassroomDBs = [];
      this.courseID = this.previewCourseID;
      await this.user.registerForCourse(this.previewCourseID, true);
    } else {
      this.user.getActiveCourses()

      if (this.focusCourseID) {
        log(`FOCUS study session: ${this.focusCourseID}`);
        this.userCourseIDs = [this.focusCourseID];
        this.userClassroomDBs = [];
      } else {


        this.userCourseIDs = this.userCourseRegDoc
          .courses
          .filter(c => c.status === undefined || c.status === 'active' || c.status === 'maintenance-mode')
          .map(course => course.courseID);

        const classRoomPromises = (await getUserClassrooms(this.$store.state._user!.username))
          .registrations
          .filter(reg => reg.registeredAs === 'student')
          .map(reg => reg.classID)
          .map(id => StudentClassroomDB.factory(id));
        this.userClassroomDBs = await Promise.all(classRoomPromises);
        this.userClassroomDBs.forEach((db) => {
          db.setChangeFcn(this.handleClassroomMessage())
        });

        if (this.userCourseIDs.length === 0
          && this.userClassroomDBs.length === 0
          && this.activeCards.length === 0) {
          this.noRegistrations = true;
        }
      }
    }

    await this.getSessionCards();
    this.sessionPrepared = true;

    log(`Session created:

${this.sessionString}

User courses: ${this.userCourseIDs.toString()}

User classrooms: ${this.userClassroomDBs.map(db => db._id)}

`);

    this.nextCard();
  }

  private registerUserForPreviewCourse() {
    this.user.registerForCourse(this.courseConfig!.courseID!).then(() =>
      this.$router.push(`/quilts/${this.courseConfig!.courseID!}`
      )
    )
  }

  private get sessionString() {
    let ret = '';
    for (let i = 0; i < this.session.length; i++) {
      ret += `${i}: ${this.session[i]}` + '\n';
    }
    return ret;
  }

  /**
   * Loads the next card in the session, and removes the
   * passed _id from session rotation (marks as complete)
   */
  public nextCard(_id?: string) {
    if (_id) {
      // const index = this.session.indexOf(_id);
      const index = this.session.findIndex((card) => {
        const card_split = card.split('-');
        const _id_split = _id.split('-');
        return _id_split[0] === card_split[0] && _id_split[1] === card_split[1];
      })
      log(`Dismissing card ${_id} (index ${index})`);

      this.session.splice(index, 1);
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
    let dueCards = await getScheduledCards(this.$store.state._user!.username);

    if (this.previewCourseID) {
      dueCards = dueCards.filter(c => c.includes(this.previewCourseID!));
    }

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

    // const cardIDs = await getRandomCards(this.userCourseIDs);
    let cardIDs: string[][] = [];
    // this.userCourseRegDoc.courses.forEach(async c => {
    //   cardIDs = cardIDs.concat(await getEloNeighborCards(c.courseID, c.elo))
    // });
    if (this.previewCourseID) {
      cardIDs.push(await getEloNeighborCards(this.previewCourseID, 1000));
    } else {
      for (let i = 0; i < this.userCourseRegDoc.courses.length; i++) {
        cardIDs.push(await getEloNeighborCards(
          this.userCourseRegDoc.courses[i].courseID,
          this.userCourseRegDoc.courses[i].elo ? this.userCourseRegDoc.courses[i].elo : 1000
        ));
      }
    }
    // console.log(`Cards: ${cardIDs.toString()}`);

    // todo: this is not correctly handling new-card picking when more
    //       than one course is involved.

    const newCards = cardIDs.map((cardList) => {
      return cardList.filter(
        (card) => {
          return this.activeCards.indexOf(card) === -1;
        });
    });
    // cardIDs.filter((cardID) => {
    //   return this.activeCards.indexOf(cardID) === -1;
    // });

    let courseIndex = randInt(newCards.length);

    function hasElements(arr: any[][]): boolean {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > 0) {
          return true;
        }
      }
      return false;
    }

    while (newCardCount > 0 && hasElements(newCards)) {
      const newCourseCards = newCards[courseIndex % newCards.length];
      if (newCourseCards.length > 0) {


        const index = randIntWeightedTowardZero(newCourseCards.length);
        this.session.push(newCourseCards.splice(index, 1)[0]);

        newCardCount--;
      }
      courseIndex++;
    }
    this.deDuplicateSession();
  }


  /**
   * Remove duplicate cards from a session. This is a debug step -
   * duplicate cards shouldn't exist. But some Scheduling issues
   * can cause them to appear.
   */
  private deDuplicateSession() {
    const priorCount: number = this.session.length;

    this.session.forEach((c, i) => {
      if (this.session.lastIndexOf(c) !== i || this.session.indexOf(c) !== i) {
        log(`Removing duplicate session card: ${c}`);
        this.session.splice(i, 1);
      }
    });

    if (this.session.length !== priorCount) {
      this.deDuplicateSession();
    }
  }

  private get currentCard(): StudySessionRecord {
    return this.sessionRecord[this.sessionRecord.length - 1];
  }

  private countCardViews(course_id: string, card_id: string): number {
    return this.sessionRecord
      .filter(r => r.card.course_id === course_id && r.card.card_id === card_id)
      .length;
  }

  private processResponse(r: CardRecord) {
    r.cardID = this.cardID;
    r.courseID = this.courseID;
    this.currentCard.records.push(r);

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
          this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`);

          // elo win for the user
          cardHistory.then((history) => {
            this.scheduleReview(history);
            if (history.records.length === 1) {
              // correct answer on first sight: elo win for student
              this.updateUserAndCardElo(1, this.courseID, this.cardID);
            } else {
              // win for the student, but adjust less aggressively as
              // the card is more familiar
              const k = Math.floor(32 / history.records.length);
              this.updateUserAndCardElo(1, this.courseID, this.cardID, k);
            }
          });

        } else {
          // user got the question right, but with multiple
          // attempts. Dismiss it, but don't remove from
          // currrent study session
          this.nextCard();
        }
      } else {
        this.$refs.shadowWrapper.classList.add('incorrect');
        if (isQuestionView(this.constructedView)) {
          if (this.currentCard.records.length >=
            this.constructedView.maxAttemptsPerView) {
            const sessionViews: number = this.countCardViews(
              this.courseID,
              this.cardID
            );
            if (sessionViews >= this.constructedView.maxSessionViews) {
              // max attempts per view and session have been reached:
              // dismiss the card from the session without scheduling
              // a review - it is too hard!
              this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`);

              // ELO - this is a 'win' for the card
              this.updateUserAndCardElo(0, this.courseID, this.cardID);
            } else {
              // max attempts on the view have been reached, but
              // card may be viewed again this session.
              this.nextCard();
            }
          }
        }
        // clear user input? todo: needs to be a fcn on CardViewer
      }
    } else {
      this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`);
    }

    this.clearFeedbackShadow();
  }

  private async updateUserAndCardElo(userScore: number, course_id: string, card_id: string, k?: number) {
    console.log(`Updating ELO scores for
      user: ${this.$store.state._user!.username}
      card: ${course_id}-${card_id}`);

    const userElo = this.userCourseRegDoc.courses.find(c => c.courseID === course_id)!.elo;
    const cardElo = this.currentCard.card.card_elo

    if (cardElo && userElo) {

      const eloUpdate = adjustScores(
        userElo,
        cardElo,
        userScore,
        k
      );
      const user = await updateUserElo(this.$store.state._user!.username, course_id, eloUpdate.userElo);
      const card = await updateCardElo(course_id, card_id, eloUpdate.cardElo);

      if (user.ok && card && card.ok) {
        console.log(`Updated ELOs:
  user: ${this.$store.state._user!.username}
  course: ${course_id}
  card: ${card_id}
      `)
        this.userCourseRegDoc.courses.find(c => c.courseID === course_id)!.elo = eloUpdate.userElo
      }

      return (user.ok && card && card.ok);
    }
  }

  private clearFeedbackShadow() {
    setTimeout(() => {
      this.$refs.shadowWrapper.classList.remove('correct', 'incorrect');
    }, 1250);
  }

  private async logCardRecord(r: CardRecord) {
    return await putCardRecord(r, this.$store.state._user!.username);
  }

  private async scheduleReview(history: CardHistory<CardRecord>) {
    const nextInterval = newInterval(history.records);
    const nextReviewTime = moment.utc().add(nextInterval, 'seconds');

    scheduleCardReview(
      {
        user: this.$store.state._user!.username,
        course_id: history.courseID,
        card_id: history.cardID,
        time: nextReviewTime,
        scheduledFor: 'course',
        schedulingAgentId: 'asof' //todo
      }
    );
  }

  /**
   * async fetch card data and view from the db
   * for the given qualified card id ("courseid-cardid-elo"),
   * and then display the card to the user.
   */
  private async loadCard(qualified_id: string) {
    this.loading = true;
    const _courseID = qualified_id.split('-')[0];
    const _cardID = qualified_id.split('-')[1];
    const _cardElo = qualified_id.split('-')[2];

    console.log(`Now displaying: ${qualified_id}`);

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

      // bleeding memory? Do these get GCd?
      this.constructedView = new this.view();

      this.sessionRecord.push({
        card: {
          course_id: _courseID,
          card_id: _cardID,
          card_elo: parseInt(_cardElo)
        },
        records: []
      });
    } catch (e) {
      log(`Error loading card: ${JSON.stringify(e)}, ${e}`);
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

a {
  text-decoration: underline;
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

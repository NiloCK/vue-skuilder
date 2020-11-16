<template>
  <div v-if="!$store.state.views.study.inSession">
    <SessionConfiguration :startFcn="initStudySession"/>
  </div>
  <div v-else>
    <div class="Study" v-if="sessionPrepared">
      
      <v-layout v-if="previewMode">
        <span class="headline">Quilt preview for <em>{{previewCourseConfig.name}}</em></span>
        <v-btn small @click="registerUserForPreviewCourse" color="primary">Join</v-btn>
        <router-link :to="`/quilts/${previewCourseConfig.courseID}`"><v-btn small color="secondary">More info</v-btn></router-link>
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
import SessionConfiguration from '@/components/Study/SessionConfiguration.vue';
import Courses, { NameSpacer } from '@/courses';
import {
  getScheduledCards,
  getRandomCards,
  getDoc,
  putCardRecord,
  scheduleCardReview,
  getCourseDoc,
  getEloNeighborCards,
  removeScheduledCardReview
} from '@/db';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import { log } from 'util';
import { newInterval } from '@/db/SpacedRepetition';
import moment from 'moment';
import { getUserClassrooms, CourseRegistrationDoc, updateUserElo, User } from '../db/userDB';
import { Watch } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { getCredentialledCourseConfig, getCardDataShape, updateCardElo, getCourseList, CourseDB } from '@/db/courseDB';
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

export interface StudySessionSource {
  type: 'course' | 'class';
  id: string;
}

@Component({
  components: {
    CardViewer,
    SkldrControlsView,
    SkTagsInput,
    SessionConfiguration
  }
})
export default class Study extends SkldrVue {
  @Prop()
  public previewCourseID?: string;
  @Prop()
  public randomPreview?: boolean;
  @Prop()
  public focusCourseID?: string;

  public coursesSelected: boolean = false;

  public previewCourseConfig?: CourseConfig;
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

  public session: {
    qualifiedID: string,
    cardID: string,
    courseID: string,
    reviewID?: string
  }[] = [];
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
  private sessionCourseIDs: string[] = [];
  private sessionClassroomDBs: StudentClassroomDB[] = [];


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

    // handle special cases from the router:
    // preview, randomPreview, focusCourse / focusClass

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
    } else if (this.previewCourseID) {

      { // set metadata for displaying a signup CTA

        this.previewMode = true;
        getCourseList().then((courses) => {
          courses.rows.forEach((c) => {
            if (c.id === this.previewCourseID) {
              this.previewCourseConfig = c.doc!;
              this.previewCourseConfig.courseID = c.id;
            }
          });
        });
      }

      log(`COURSE PREVIEW MODE FOR ${this.previewCourseID}`);
      await this.user.registerForCourse(this.previewCourseID, true);

      this.initStudySession([{ type: "course", id: this.previewCourseID }]);
    } else if (this.focusCourseID) {
      log(`FOCUS study session: ${this.focusCourseID}`);

      this.initStudySession([{ type: "course", id: this.focusCourseID }]);
    }

  }

  private async initStudySession(sources: StudySessionSource[]) {
    console.log(`starting study session w/ sources: ${JSON.stringify(sources)}`);
    this.sessionCourseIDs = sources.filter(s => s.type === 'course').map(c => c.id);

    this.activeCards = await this.user.getActiveCards();

    const classRoomPromises = (await getUserClassrooms(this.$store.state._user!.username))
      .registrations
      .filter(reg => reg.registeredAs === 'student')
      .map(reg => reg.classID)
      .map(id => StudentClassroomDB.factory(id));
    this.sessionClassroomDBs = await Promise.all(classRoomPromises);
    this.sessionClassroomDBs.forEach((db) => {
      db.setChangeFcn(this.handleClassroomMessage())
    });

    if (this.sessionCourseIDs.length === 0
      && this.sessionClassroomDBs.length === 0
      && this.activeCards.length === 0) {
      this.noRegistrations = true;
    }

    await this.getSessionCards();
    this.sessionPrepared = true;

    log(`Session created:

${this.sessionString}

User courses: ${this.sessionCourseIDs.toString()}

User classrooms: ${this.sessionClassroomDBs.map(db => db._id)}

`);

    this.$store.state.views.study.inSession = true;
    this.nextCard();
  }

  private registerUserForPreviewCourse() {
    this.user.registerForCourse(this.previewCourseConfig!.courseID!).then(() =>
      this.$router.push(`/quilts/${this.previewCourseConfig!.courseID!}`
      )
    )
  }

  private get sessionString() {
    let ret = '';
    for (let i = 0; i < this.session.length; i++) {
      ret += `${i}: ${this.session[i].qualifiedID}`;
      if (this.session[i].reviewID) {
        ret += ' (review)';
      }
      ret += '\n';
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
        const card_split = card.qualifiedID.split('-');
        const _id_split = _id.split('-');
        return _id_split[0] === card_split[0] && _id_split[1] === card_split[1];
      })
      log(`Dismissing card ${_id} (index ${index})`);

      if (this.session[index].reviewID) {
        removeScheduledCardReview(
          this.user.username,
          this.session[index].reviewID!
        )
      }

      this.session.splice(index, 1);
    }

    log(`Cards left in session:
${this.sessionString}
    `);

    if (this.session.length === 0) {
      this.sessionFinished = true;
      // this.$store.state.views.study.inSession = false;
    } else {
      this.loadCard(this.session[
        randInt(this.session.length)
      ].qualifiedID);
    }
  }

  private async getSessionCards() {
    // start with the review cards that are 'due'
    let dueCards = await getScheduledCards(this.$store.state._user!.username);
    console.log(`${dueCards.length} reviews available`);

    // and filter them for the current session
    dueCards = dueCards.filter(c => {
      return this.sessionCourseIDs.some(crs => crs === c.courseId)
    });
    console.log(`${dueCards.length} reviews available after filtering`);

    this.session = this.session.concat(
      // slice w/ min here in case there are more cards due
      // than the configured session length
      dueCards.slice(0, Math.min(this.SessionCount, dueCards.length))
        .map(c => {
          return {
            cardID: c.cardId,
            courseID: c.courseId,
            qualifiedID: `${c.courseId}-${c.cardId}`,
            reviewID: c._id
          }
        })
    );

    // # of new cards is at least one, otherwise fills half
    // of the remaining session space
    let newCardCount: number = Math.max(
      1,
      Math.ceil(
        (this.SessionCount - this.session.length) / 2
      )
    );

    let cardIDs: string[][] = [];

    for (let i = 0; i < this.sessionCourseIDs.length; i++) {
      // get elo neighbor cards for each course in session
      const courseID = this.sessionCourseIDs[i];
      let courseELO = this.userCourseRegDoc.courses.find(
        c => c.courseID === this.sessionCourseIDs[i])!.elo

      if (!courseELO) { courseELO = 1000; }

      cardIDs.push(await getEloNeighborCards(
        courseID,
        courseELO
      ));
    }

    // cards previously seen are filtered out
    const newCards = cardIDs.map((cardList) => {
      return cardList.filter(
        (card) => {
          return this.activeCards.indexOf(card) === -1;
        });
    });

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
        const card = newCourseCards.splice(index, 1)[0].split('-');
        this.session.push({
          courseID: card[0],
          cardID: card[1],
          qualifiedID: card[0] + '-' + card[1]
        });

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
    for (let i = 0; i < this.session.length; i++) {
      for (let j = i + 1; j < this.session.length; j++) {
        if (this.session[i].qualifiedID === this.session[j].qualifiedID) {
          log(`Removing duplicate session card: ${JSON.stringify(this.session[j])}`);
          this.session.splice(j, 1);
          // start over!
          this.deDuplicateSession();
        }
      }
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

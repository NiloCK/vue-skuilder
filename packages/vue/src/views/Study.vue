<template>
  <div v-if="!$store.state.views.study.inSession">
    <SessionConfiguration v-bind:startFcn="initStudySession" />
  </div>
  <div v-else>
    <div v-if="sessionPrepared" class="Study">
      <v-layout v-if="previewMode && previewCourseConfig">
        <span class="headline"
          >Quilt preview for <em>{{ previewCourseConfig.name }}</em></span
        >
        <v-btn small @click="registerUserForPreviewCourse" color="primary">Join</v-btn>
        <router-link :to="`/quilts/${previewCourseConfig.courseID}`"
          ><v-btn small color="secondary">More info</v-btn></router-link
        >
        <v-spacer></v-spacer>
        <SkldrControlsView />
      </v-layout>
      <v-layout v-else-if="previewMode">
        <span class="headline">... No course was specified for the preview.</span>
        <div>(this shouldn't happen)...</div>
      </v-layout>
      <v-layout v-else>
        <h1 class="display-1">
          {{ courseNames[courseID] }}:
          <v-progress-circular
            v-if="loading"
            absolute
            top
            color="primary"
            indeterminate
            rotate="0"
            size="32"
            value="0"
            width="4"
          />
        </h1>
        <v-spacer></v-spacer>
        <SkldrControlsView />
      </v-layout>

      <br />

      <div v-if="!checkLoggedIn" class="display-1">
        <p>Sign up to get to work!</p>
      </div>

      <div v-else-if="sessionFinished" class="display-1">
        <p>Study session finished! Great job!</p>
        <p>{{ sessionController.report }}</p>
        <p>
          Start <a @click="refreshRoute">another study session</a>, or try
          <router-link :to="`/edit/${courseID}`">adding some new content</router-link> to challenge yourself and others!
        </p>
      </div>

      <div v-else ref="shadowWrapper">
        <card-viewer
          :class="loading ? 'muted' : ''"
          :view="view"
          :data="data"
          :card_id="cardID"
          :course_id="courseID"
          :session-order="cardCount"
          v-on:emitResponse="processResponse($event)"
        />
        <!-- <pre>
        {{ sessionController.detailedReport }}
        </pre> -->
        <!-- <card-loader
          :class="loading ? 'muted' : ''"
          :qualified_id="`${courseID}-${cardID}`"
          :sessionOrder="cardCount"
          v-on:emitResponse="processResponse($event)"
        /> -->
      </div>

      <br />
      <div v-if="sessionController">
        <span class="headline" v-for="i in sessionController.failedCount" :key="i">•</span>
        <!-- {{ cardType }} -->
        <!-- 
        <br><br><br>
        Session Report: {{ sessionController.reportString()}}
        <br><br><br>
        Current Queues: {{ sessionController.toString() }}
         -->
      </div>

      <div v-if="!sessionFinished && editTags">
        <p>Add tags to this card:</p>
        <sk-tags-input :courseID="courseID" :cardID="cardID" />
      </div>
      <v-tooltip
        fixed
        activator
        right
        open-delay="0"
        close-delay="200"
        color="secondary"
        content-class="subheading"
        transition="slide-x-transition"
        v-model="timerIsActive"
      >
        <v-btn
          slot="activator"
          v-if="!sessionFinished"
          fab
          color="transparent"
          bottom
          left
          fixed
          :title="timeString"
          @click="if (timerIsActive) incrementSessionClock();"
        >
          <v-progress-circular
            alt="Time remaining in study session"
            centered
            size="64"
            width="8"
            rotate="-90"
            :color="timerColor"
            :value="percentageRemaining"
          >
            <v-icon v-if="timerIsActive" large dark>add</v-icon>
          </v-progress-circular>
        </v-btn>
        {{ timeString }}
      </v-tooltip>
      <v-speed-dial v-if="!sessionFinished" v-model="fab" fixed bottom right transition="scale-transition">
        <template v-slot:activator>
          <v-btn v-model="fab" color="blue darken-2" dark fab>
            <v-icon v-if="fab">close</v-icon>
            <v-icon v-else>edit</v-icon>
          </v-btn>
        </template>
        <router-link :to="`/edit/${courseID}`">
          <v-btn fab small dark color="indigo" title="Add content to this course">
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
          :loading="editCard"
        >
          <v-icon>bookmark</v-icon>
        </v-btn>
      </v-speed-dial>
    </div>
  </div>
</template>

<script lang="ts">
import { displayableDataToViewData, ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable, { isQuestionView } from '@/base-course/Viewable';
import SkTagsInput from '@/components/Edit/TagsInput.vue';
import CardLoader from '@/components/Study/CardLoader.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import SessionConfiguration from '@/components/Study/SessionConfiguration.vue';
import Courses from '@/courses';
import { getCourseDoc, putCardRecord, removeScheduledCardReview, scheduleCardReview } from '@/db';
import { ContentSourceID, getStudySource, isReview, StudyContentSource, StudySessionItem } from '@/db/contentSource';
import { getCredentialledCourseConfig } from '@/db/courseAPI';
import { CourseDB, getCourseList, getCourseName, updateCardElo } from '@/db/courseDB';
import { getCardDataShape } from '@/db/getCardDataShape';
import SessionController, { StudySessionRecord } from '@/db/SessionController';
import { newInterval } from '@/db/SpacedRepetition';
import { CardData, CardHistory, CardRecord, DisplayableData, isQuestionRecord } from '@/db/types';
import SkldrVue from '@/SkldrVue';
import { adjustCourseScores, toCourseElo } from '@/tutor/Elo';
import confetti from 'canvas-confetti';
import moment from 'moment';
import { VueConstructor } from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import SkldrControlsView from '../components/SkMouseTrap.vue';
import { alertUser } from '../components/SnackbarService.vue';
import { randomInt } from '../courses/math/utility';
import { StudentClassroomDB } from '../db/classroomDB';
import { CourseRegistrationDoc, updateUserElo, User } from '../db/userDB';
import { Status } from '../enums/Status';
import { CourseConfig } from '../server/types';

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

@Component({
  components: {
    CardViewer,
    CardLoader,
    SkldrControlsView,
    SkTagsInput,
    SessionConfiguration,
  },
})
export default class Study extends SkldrVue {
  @Prop()
  public previewCourseID?: string;
  @Prop()
  public randomPreview?: boolean;
  @Prop()
  public focusCourseID?: string;

  public previewCourseConfig?: CourseConfig;
  public previewMode: boolean = false;

  public fab: boolean = false; // open the speed-dial fab
  public editTags: boolean = false; // open the tagsInput for this card
  public editCard: boolean = false; // open the editor for this card
  public editCardReady: boolean = false; // editor for this card is ready to display
  // the currently displayed card
  public cardID: PouchDB.Core.DocumentId = '';
  public view: VueConstructor;
  public constructedView: Viewable;
  public data: ViewData[] = [];
  public courseID: string = '';

  public courseNames: { [courseID: string]: string } = {};
  // public courseName(id: string): string {
  //   if (this.courseNames[id]) {
  //     return this.courseNames[id];
  //   } else {
  //     getCourseName(id).then((name) => {
  //       this.courseNames[id] = name;
  //     });
  //     return '';
  //   }
  // }

  public cardCount: number = 1;

  // public session: StudySessionItem[] = [];
  private sessionController: SessionController;
  public sessionPrepared: boolean = false;
  public sessionFinished: boolean = false;
  public sessionRecord: StudySessionRecord[] = [];

  private percentageRemaining: number = 100;
  private get timerColor(): string {
    if (this.timeRemaining > 60) {
      return 'primary';
    } else {
      return 'orange darken-3';
    }
  }

  private timerIsActive: boolean = false;
  private timeString: string = '';
  private timeRemaining: number = this.$store.state.views.study.sessionTimeLimit * 60;
  private _intervalHandler: NodeJS.Timeout;
  private incrementSessionClock() {
    let max = 60 * this.$store.state.views.study.sessionTimeLimit - this.timeRemaining;

    this.sessionController.addTime(Math.min(max, 60));
    this.tick();
  }
  private tick() {
    this.timeRemaining = this.sessionController.secondsRemaining;
    this.setTimeString();

    this.percentageRemaining =
      this.timeRemaining > 60
        ? 100 * (this.timeRemaining / (60 * this.$store.state.views.study.sessionTimeLimit))
        : 100 * (this.timeRemaining / 60);

    if (this.timeRemaining === 0) {
      clearInterval(this._intervalHandler);
    }
  }
  private setTimeString() {
    this.timeString = '';
    if (this.timeRemaining > 60) {
      this.timeString = Math.floor(this.timeRemaining / 60).toString() + ':';
    }
    const secondsRemaining: number = this.timeRemaining % 60;
    this.timeString += secondsRemaining >= 10 ? secondsRemaining : '0' + secondsRemaining;
    if (this.timeRemaining <= 60) {
      this.timeString += ' seconds';
    }
    this.timeString += ' left!';
  }

  public loading: boolean = false;
  public user: User;

  public $refs: {
    shadowWrapper: HTMLDivElement;
  };
  private userCourseRegDoc: CourseRegistrationDoc;

  private sessionContentSources: StudyContentSource[] = [];
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
      this.$store.state.dataInputForm.dataShape = await getCardDataShape(this.courseID, this.cardID);

      const cfg = await getCredentialledCourseConfig(this.courseID);
      this.$store.state.dataInputForm.course = cfg!;

      this.editCardReady = true;

      // clear any stale data from the inputForm 'store'
      for (const oldField in this.$store.state.dataInputForm.localStore) {
        if (oldField) {
          console.log(`Removing old data: ${oldField}`);
          delete this.$store.state.dataInputForm.localStore[oldField];
        }
      }

      // repopulate the inputForm store w/ this card's data
      for (const field in this.data[0]) {
        if (field) {
          console.log(`Writing ${field}: ${this.data[0][field]} to the dataInputForm state...`);
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
        status: Status.ok,
      });
      console.log(`There was a change in the classroom DB:`);
      console.log(`change: ${v}`);
      console.log(`Stringified change: ${JSON.stringify(v)}`);
      return {};
    };
  }

  public refreshRoute() {
    this.$router.go(0);
  }

  public async created() {
    this.sessionPrepared = false;
    this.$store.state.views.study.inSession = false;

    this.user = await User.instance();
    this.userCourseRegDoc = await this.user.getCourseRegistrationsDoc();

    // handle special cases from the router:
    // preview, randomPreview, focusCourse / focusClass

    if (this.randomPreview) {
      // set a .previewCourseID
      const allCourses = (await getCourseList()).rows.map(r => r.id);
      console.log(`RANDOMPREVIEW:
      Courses:
      ${allCourses.toString()}`);
      const unRegisteredCourses = allCourses.filter(c => {
        return !this.userCourseRegDoc.courses.some(rc => rc.courseID === c);
      });
      if (unRegisteredCourses.length > 0) {
        this.previewCourseID = unRegisteredCourses[randomInt(0, unRegisteredCourses.length)];
      } else {
        this.previewCourseID = allCourses[randomInt(0, allCourses.length)];
      }
    } else if (this.previewCourseID) {
      {
        // set metadata for displaying a signup CTA

        this.previewMode = true;
        getCourseList().then(courses => {
          courses.rows.forEach(c => {
            if (c.id === this.previewCourseID) {
              this.previewCourseConfig = c.doc!;
              this.previewCourseConfig.courseID = c.id;
            }
          });
        });
      }

      console.log(`COURSE PREVIEW MODE FOR ${this.previewCourseID}`);
      await this.user.registerForCourse(this.previewCourseID, true);

      this.initStudySession([{ type: 'course', id: this.previewCourseID }]);
    } else if (this.focusCourseID) {
      console.log(`FOCUS study session: ${this.focusCourseID}`);

      this.initStudySession([{ type: 'course', id: this.focusCourseID }]);
    }
  }

  /**
   * Pulls scheduled reviews, prescribes new cards, and
   * declares session to be started (activating card-viewer
   * and main flow).
   *
   * NB: This function is passed to and called by the SessionConfiguration
   *     component
   */
  private async initStudySession(sources: ContentSourceID[]) {
    console.log(`starting study session w/ sources: ${JSON.stringify(sources)}`);

    this.sessionContentSources = await Promise.all(sources.map(s => getStudySource(s)));

    this.sessionClassroomDBs = await Promise.all(
      sources
        .filter(s => s.type === 'classroom')
        .map(async c => {
          return StudentClassroomDB.factory(c.id);
        })
    );

    this.sessionClassroomDBs.forEach(db => {
      db.setChangeFcn(this.handleClassroomMessage());
    });

    this.sessionController = new SessionController(
      this.sessionContentSources,
      60 * this.$store.state.views.study.sessionTimeLimit
    );
    this.sessionController.sessionRecord = this.sessionRecord;

    await this.sessionController.prepareSession();
    this._intervalHandler = setInterval(this.tick, 1000);

    this.sessionPrepared = true;

    // Populate course names from IDs
    sources.filter(s => s.type === 'course').forEach(async c => (this.courseNames[c.id] = await getCourseName(c.id)));

    console.log(`Session created:
${this.sessionController.toString()}
User courses: ${sources
      .filter(s => s.type === 'course')
      .map(c => c.id)
      .toString()}
User classrooms: ${this.sessionClassroomDBs.map(db => db._id)}
`);

    this.$store.state.views.study.inSession = true;
    this.loadCard(this.sessionController.nextCard());
  }

  private registerUserForPreviewCourse() {
    this.user
      .registerForCourse(this.previewCourseConfig!.courseID!)
      .then(() => this.$router.push(`/quilts/${this.previewCourseConfig!.courseID!}`));
  }

  private get currentCard(): StudySessionRecord {
    return this.sessionRecord[this.sessionRecord.length - 1];
  }

  private countCardViews(course_id: string, card_id: string): number {
    return this.sessionRecord.filter(r => r.card.course_id === course_id && r.card.card_id === card_id).length;
  }

  @Emit('emitResponse')
  private processResponse(r: CardRecord) {
    // alert(JSON.stringify(r));
    // clear the timer state
    this.timerIsActive = false;

    r.cardID = this.cardID;
    r.courseID = this.courseID;
    this.currentCard.records.push(r);

    console.log(`Study.processResponse is running...`);
    const cardHistory = this.logCardRecord(r);

    if (isQuestionRecord(r)) {
      console.log(`Question is ${r.isCorrect ? '' : 'in'}correct`);
      if (r.isCorrect) {
        this.$refs.shadowWrapper.setAttribute('style', `--r: ${255 * (1 - (r.performance as number))}; --g:${255}`);
        this.$refs.shadowWrapper.classList.add('correct');

        if (this.$store.state.config.likesConfetti) {
          confetti({
            origin: {
              y: 1,
              x: 0.25 + 0.5 * Math.random(),
            },
            disableForReducedMotion: true,
            angle: 60 + 60 * Math.random(),
          });
        }

        if (r.priorAttemps === 0) {
          const item: StudySessionItem = {
            ...this.currentCard.item,
          };
          // user got the question right on 'the first try'.
          // dismiss the card from this study session, and
          // schedule its review in the future.
          this.loadCard(this.sessionController.nextCard('dismiss-success'));
          // this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`, 'dismiss-success');

          // elo win for the user
          cardHistory.then(history => {
            this.scheduleReview(history, item);
            if (history.records.length === 1) {
              // correct answer on first sight: elo win for student
              this.updateUserAndCardElo(0.5 + (r.performance as number) / 2, this.courseID, this.cardID);
            } else {
              // win for the student, but adjust less aggressively as
              // the card is more familiar
              const k = Math.ceil(32 / history.records.length);
              this.updateUserAndCardElo(0.5 + (r.performance as number) / 2, this.courseID, this.cardID, k);
            }
          });
        } else {
          // user got the question right, but with multiple
          // attempts. Dismiss it, but don't remove from
          // currrent study session
          // this.nextCard();
          this.loadCard(this.sessionController.nextCard('marked-failed'));
          // this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`, 'mark-failed');
        }
      } else {
        this.$refs.shadowWrapper.classList.add('incorrect');
        // elo loss for the user
        cardHistory.then(history => {
          if (history.records.length !== 1 && r.priorAttemps === 0) {
            // incorrect answer on a scheduled review: elo win for card
            this.updateUserAndCardElo(0, this.courseID, this.cardID);
          }
        });

        if (isQuestionView(this.constructedView)) {
          if (this.currentCard.records.length >= this.constructedView.maxAttemptsPerView) {
            const sessionViews: number = this.countCardViews(this.courseID, this.cardID);
            if (sessionViews >= this.constructedView.maxSessionViews) {
              // max attempts per view and session have been reached:
              // dismiss the card from the session without scheduling
              // a review - it is too hard!
              this.loadCard(this.sessionController.nextCard('dismiss-failed'));
              // this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`, 'dismiss-failed');

              // ELO - this is a 'win' for the card
              this.updateUserAndCardElo(0, this.courseID, this.cardID);
            } else {
              // max attempts on the view have been reached, but
              // card may be viewed again this session.
              // this.nextCard();
              this.loadCard(this.sessionController.nextCard('marked-failed'));
              // this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`, 'mark-failed');
            }
          }
        }
        // clear user input? todo: needs to be a fcn on CardViewer
      }
    } else {
      this.loadCard(this.sessionController.nextCard('dismiss-success'));
      // this.nextCard(`${r.courseID}-${r.cardID}-${this.currentCard.card.card_elo}`, 'dismiss-success');
    }

    this.clearFeedbackShadow();
  }

  private async updateUserAndCardElo(userScore: number, course_id: string, card_id: string, k?: number) {
    const userElo = toCourseElo(this.userCourseRegDoc.courses.find(c => c.courseID === course_id)!.elo);
    const cardElo = (
      await new CourseDB(this.currentCard.card.course_id).getCardEloData([this.currentCard.card.card_id])
    )[0];

    if (cardElo && userElo) {
      const eloUpdate = adjustCourseScores(userElo, cardElo, userScore);
      this.userCourseRegDoc.courses.find(c => c.courseID === course_id)!.elo = eloUpdate.userElo;

      Promise.all([
        updateUserElo(this.$store.state._user!.username, course_id, eloUpdate.userElo),
        updateCardElo(course_id, card_id, eloUpdate.cardElo),
      ]).then(results => {
        const user = results[0];
        const card = results[1];

        if (user.ok && card && card.ok) {
          console.log(
            `Updated ELOS:
\tUser: ${JSON.stringify(eloUpdate.userElo)})
\tCard: ${JSON.stringify(eloUpdate.cardElo)})
`
          );
        }
      });
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

  private async scheduleReview(history: CardHistory<CardRecord>, item: StudySessionItem) {
    const nextInterval = newInterval(history);
    const nextReviewTime = moment.utc().add(nextInterval, 'seconds');

    if (isReview(item)) {
      console.log(`Removing previously scheduled review for: ${item.cardID}`);
      removeScheduledCardReview(this.user.username, item.reviewID);
    }

    scheduleCardReview({
      user: this.$store.state._user!.username,
      course_id: history.courseID,
      card_id: history.cardID,
      time: nextReviewTime,
      scheduledFor: item.contentSourceType,
      schedulingAgentId: item.contentSourceID,
    });
  }

  public cardType: string = '';

  /**
   * async fetch card data and view from the db
   * for the given qualified card id ("courseid-cardid-elo"),
   * and then display the card to the user.
   */
  private async loadCard(item: StudySessionItem | null) {
    console.log(`loading: ${JSON.stringify(item)}`);
    if (item === null) {
      this.sessionFinished = true; // ??
      return;
    }
    this.cardType = item.status;

    const qualified_id = item.qualifiedID;

    this.loading = true;
    const _courseID = qualified_id.split('-')[0];
    const _cardID = qualified_id.split('-')[1];
    const _cardElo = qualified_id.split('-')[2];

    console.log(`Now displaying: ${qualified_id}`);

    try {
      // const tmpCardData = await CardCache.getDoc<CardData>(qualified_id);
      const tmpCardData = await getCourseDoc<CardData>(_courseID, _cardID);
      const tmpView = Courses.getView(tmpCardData.id_view);
      const tmpDataDocs = await tmpCardData.id_displayable_data.map(id => {
        return getCourseDoc<DisplayableData>(_courseID, id, {
          attachments: true,
          binary: true,
        });
      });

      const tmpData = [];

      for (const docPromise of tmpDataDocs) {
        const doc = await docPromise;

        tmpData.unshift(displayableDataToViewData(doc));
      }

      this.cardCount++;
      this.data = tmpData;
      this.view = tmpView;
      this.cardID = _cardID;
      this.courseID = _courseID;

      // bleeding memory? Do these get GCd?
      this.constructedView = new this.view() as Viewable;

      this.sessionRecord.push({
        card: {
          course_id: _courseID,
          card_id: _cardID,
          card_elo: parseInt(_cardElo),
        },
        item: item,
        records: [],
      });
    } catch (e) {
      console.log(`Error loading card: ${JSON.stringify(e)}, ${e}`);
      // this.nextCard(qualified_id, 'dismiss-error');
      this.loadCard(this.sessionController.nextCard('dismiss-error'));
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
  animation: varFade 1250ms ease-out;
}

.incorrect {
  animation: purpleFade 1250ms ease-out;
}

a {
  text-decoration: underline;
}

@keyframes varFade {
  0% {
    box-shadow: rgba(var(--r), var(--g), 0, 0.25) 0px 7px 8px -4px, rgba(var(--r), var(--g), 0, 0.25) 0px 12px 17px 2px,
      rgba(var(--r), var(--g), 0, 0.25) 0px 5px 22px 4px;
  }
  100% {
    box-shadow: rgba(0, 150, 0, 0) 0px 0px;
  }
}

@keyframes greenFade {
  0% {
    box-shadow: rgba(0, 150, 0, 0.25) 0px 7px 8px -4px, rgba(0, 150, 0, 0.25) 0px 12px 17px 2px,
      rgba(0, 150, 0, 0.25) 0px 5px 22px 4px;
  }
  100% {
    box-shadow: rgba(0, 150, 0, 0) 0px 0px;
  }
}
@keyframes purpleFade {
  0% {
    box-shadow: rgba(115, 0, 75, 0.25) 0px 7px 8px -4px, rgba(115, 0, 75, 0.25) 0px 12px 17px 2px,
      rgba(115, 0, 75, 0.25) 0px 5px 22px 4px;
  }
  100% {
    box-shadow: rgba(115, 0, 75, 0) 0px 0px;
  }
}
</style>

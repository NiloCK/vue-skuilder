<template>
  <div v-if="!inSession">
    <SessionConfiguration
      v-bind:startFcn="initStudySession"
      v-bind:initialTimeLimit="sessionTimeLimit"
      v-on:update:timeLimit="(val) => (sessionTimeLimit = val)"
    />
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

      <div v-if="!checkLoggedIn" class="text-h4">
        <p>Sign up to get to work!</p>
      </div>

      <div v-else-if="sessionFinished" class="text-h4">
        <p>Study session finished! Great job!</p>
        <p v-if="sessionController">{{ sessionController.report }}</p>
        <p>
          Start <a @click="refreshRoute">another study session</a>, or try
          <router-link :to="`/edit/${courseID}`">adding some new content</router-link> to challenge yourself and others!
        </p>
        <heat-map />
      </div>

      <div v-else ref="shadowWrapper">
        <card-viewer
          :class="loading ? 'muted' : ''"
          :view="view"
          :data="data"
          :card_id="cardID"
          :course_id="courseID"
          :session-order="cardCount"
          :user_elo="user_elo(courseID)"
          :card_elo="card_elo"
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
        right
        :open-delay="0"
        :close-delay="200"
        color="secondary"
        content-class="subheading"
        transition="slide-x-transition"
        v-model="timerIsActive"
      >
        <template #activator="{ isActive, props }">
          <v-btn
            v-if="!sessionFinished"
            v-bind="props"
            fab
            color="transparent"
            bottom
            left
            fixed
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
              <v-icon v-if="timerIsActive" large dark>mdi-add</v-icon>
            </v-progress-circular>
          </v-btn>
        </template>
        {{ timeString }}
      </v-tooltip>
      <v-speed-dial v-if="!sessionFinished" v-model="fab" fixed bottom right transition="scale-transition">
        <template v-slot:activator>
          <v-btn v-model="fab" color="blue darken-2" dark fab>
            <v-icon>{{ fab ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
          </v-btn>
        </template>
        <router-link :to="`/edit/${courseID}`">
          <v-btn fab small dark color="indigo" title="Add content to this course">
            <v-icon>mdi-plus</v-icon>
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
          <v-icon>mdi-bookmark</v-icon>
        </v-btn>
      </v-speed-dial>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ViewComponent, isDefineComponent } from '@/base-course/Displayable';
import { displayableDataToViewData, ViewData } from '@/base-course/Interfaces/ViewData';
import { isQuestionView } from '@/base-course/CompositionViewable';
import SkTagsInput from '@/components/Edit/TagsInput.vue';
import HeatMap from '@/components/HeatMap.vue';
import CardLoader from '@/components/Study/CardLoader.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import SessionConfiguration from '@/components/Study/SessionConfiguration.vue';
import Courses from '@/courses';
import { getCourseDoc, putCardRecord, removeScheduledCardReview, scheduleCardReview } from '@/db';
import { ContentSourceID, getStudySource, isReview, StudyContentSource, StudySessionItem } from '@/db/contentSource';
import { getCredentialledCourseConfig } from '@/db/courseAPI';
import { CourseDB, getCourseList, getCourseName, updateCardElo, docIsDeleted } from '@/db/courseDB';
import { getCardDataShape } from '@/db/getCardDataShape';
import SessionController, { StudySessionRecord } from '@/db/SessionController';
import { newInterval } from '@/db/SpacedRepetition';
import { CardData, CardHistory, CardRecord, DisplayableData, isQuestionRecord } from '@/db/types';
import { adjustCourseScores, CourseElo, toCourseElo, isCourseElo } from '@/tutor/Elo';
import confetti from 'canvas-confetti';
import moment from 'moment';
import SkldrControlsView from '../components/SkMouseTrap.vue';
import { alertUser } from '../components/SnackbarService.vue';
import { randomInt } from '../courses/math/utility';
import { StudentClassroomDB } from '../db/classroomDB';
import { CourseRegistrationDoc, updateUserElo, User } from '../db/userDB';
import { Status } from '../enums/Status';
import { CourseConfig } from '../server/types';
import { useConfigStore } from '@/stores/useConfigStore';
import { useDataInputFormStore } from '@/stores/useDataInputFormStore';
import { Router } from 'vue-router';

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

interface StudyRefs {
  shadowWrapper: HTMLDivElement;
}

type StudyInstance = ReturnType<typeof defineComponent> & {
  $refs: StudyRefs;
};

export default defineComponent({
  name: 'Study',

  ref: {} as StudyRefs,

  inject: {
    router: {
      from: 'router',
    },
  },

  emits: {
    emitResponse: (response: CardRecord) => true,
  },

  components: {
    CardViewer,
    CardLoader,
    SkldrControlsView,
    SkTagsInput,
    SessionConfiguration,
    HeatMap,
  },

  props: {
    previewCourseID: {
      type: String,
      required: false,
    },
    randomPreview: {
      type: Boolean,
      required: false,
    },
    focusCourseID: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      user: null as User | null,
      configStore: null as ReturnType<typeof useConfigStore> | null,
      previewCourseConfig: undefined as CourseConfig | undefined,
      previewMode: false,
      fab: false,
      editTags: false,
      editCard: false,
      editCardReady: false,
      cardID: '',
      view: null as ViewComponent | null,
      constructedView: null as any | null, // [ ] #vue3 - type this properly
      data: [] as ViewData[],
      courseID: '',
      card_elo: 1000,
      courseNames: {} as { [courseID: string]: string },
      cardCount: 1,
      sessionController: null as SessionController | null,
      sessionPrepared: false,
      sessionFinished: false,
      sessionRecord: [] as StudySessionRecord[],
      percentageRemaining: 100,
      timerIsActive: false,
      timeString: '',
      loading: false,
      userCourseRegDoc: null as CourseRegistrationDoc | null,
      sessionContentSources: [] as StudyContentSource[],
      sessionTimeLimit: 5,
      timeRemaining: 300, // 5 minutes * 60 seconds
      _intervalHandler: null as NodeJS.Timeout | null,
      cardType: '',
      inSession: false,
      dataInputFormStore: useDataInputFormStore(),
    };
  },

  computed: {
    timerColor(): string {
      return this.timeRemaining > 60 ? 'primary' : 'orange darken-3';
    },

    checkLoggedIn(): boolean {
      // [ ] TODO: check if user is logged in
      return true;
    },

    currentCard(): StudySessionRecord {
      return this.sessionRecord[this.sessionRecord.length - 1];
    },
  },

  watch: {
    editCard: {
      async handler(value: boolean) {
        if (value) {
          this.dataInputFormStore.dataInputForm.dataShape = await getCardDataShape(this.courseID, this.cardID);

          const cfg = await getCredentialledCourseConfig(this.courseID);
          this.dataInputFormStore.dataInputForm.course = cfg!;

          this.editCardReady = true;

          for (const oldField in this.dataInputFormStore.dataInputForm.localStore) {
            if (oldField) {
              console.log(`[Study] Removing old data: ${oldField}`);
              delete this.dataInputFormStore.dataInputForm.localStore[oldField];
            }
          }

          for (const field in this.data[0]) {
            if (field) {
              console.log(`[Study] Writing ${field}: ${this.data[0][field]} to the dataInputForm state...`);
              this.dataInputFormStore.dataInputForm.localStore[field] = this.data[0][field];
            }
          }
        } else {
          this.editCardReady = false;
        }
      },
    },
  },

  async created() {
    this.sessionPrepared = false;

    this.user = await User.instance();
    this.userCourseRegDoc = await this.user.getCourseRegistrationsDoc();
    this.configStore = useConfigStore();

    let singletonStudyCourseID = '';

    if (this.randomPreview) {
      const allCourses = (await getCourseList()).rows.map((r) => r.id);
      const unRegisteredCourses = allCourses.filter((c) => {
        return !this.userCourseRegDoc!.courses.some((rc) => rc.courseID === c);
      });
      if (unRegisteredCourses.length > 0) {
        singletonStudyCourseID = unRegisteredCourses[randomInt(0, unRegisteredCourses.length)];
      } else {
        singletonStudyCourseID = allCourses[randomInt(0, allCourses.length)];
      }
    }

    if (this.previewCourseID) {
      this.previewMode = true;
      getCourseList().then((courses) => {
        courses.rows.forEach((c) => {
          if (c.id === this.previewCourseID) {
            this.previewCourseConfig = c.doc!;
            this.previewCourseConfig.courseID = c.id;
          }
        });
      });

      console.log(`[Study] COURSE PREVIEW MODE FOR ${this.previewCourseID}`);
      await this.user!.registerForCourse(this.previewCourseID, true);

      singletonStudyCourseID = this.previewCourseID;
    }

    if (this.focusCourseID) {
      console.log(`[Study] FOCUS study session: ${this.focusCourseID}`);
      singletonStudyCourseID = this.focusCourseID;
    }

    if (singletonStudyCourseID) {
      this.initStudySession([{ type: 'course', id: singletonStudyCourseID }], this.sessionTimeLimit);
    }
  },

  methods: {
    user_elo(courseID: string): CourseElo {
      const courseDoc = this.userCourseRegDoc!.courses.find((c) => c.courseID === courseID);
      if (courseDoc) {
        return toCourseElo(courseDoc.elo);
      }
      return toCourseElo(undefined);
    },

    refreshRoute() {
      (this.router as Router).go(0);
    },

    handleClassroomMessage() {
      return (v: any) => {
        alertUser({
          text: this.user?.username || '[Unknown user]',
          status: Status.ok,
        });
        console.log(`[Study] There was a change in the classroom DB:`);
        console.log(`[Study] change: ${v}`);
        console.log(`[Study] Stringified change: ${JSON.stringify(v)}`);
        return {};
      };
    },

    incrementSessionClock() {
      const max = 60 * this.sessionTimeLimit - this.timeRemaining;
      this.sessionController!.addTime(Math.min(max, 60));
      this.tick();
    },

    tick() {
      this.timeRemaining = this.sessionController!.secondsRemaining;
      this.setTimeString();

      this.percentageRemaining =
        this.timeRemaining > 60
          ? 100 * (this.timeRemaining / (60 * this.sessionTimeLimit))
          : 100 * (this.timeRemaining / 60);

      if (this.timeRemaining === 0) {
        clearInterval(this._intervalHandler!);
      }
    },

    setTimeString() {
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
    },

    async initStudySession(sources: ContentSourceID[], timeLimit: number) {
      console.log(`[Study] starting study session w/ sources: ${JSON.stringify(sources)}`);

      this.sessionContentSources = (
        await Promise.all(
          sources.map(async (s) => {
            try {
              return await getStudySource(s);
            } catch (e) {
              console.error(`Failed to load study source: ${s.type}/${s.id}`, e);
              return null;
            }
          })
        )
      ).filter((s) => s !== null);

      this.sessionTimeLimit = timeLimit;
      this.timeRemaining = timeLimit * 60;

      const sessionClassroomDBs = await Promise.all(
        sources.filter((s) => s.type === 'classroom').map(async (c) => StudentClassroomDB.factory(c.id))
      );

      sessionClassroomDBs.forEach((db) => {
        db.setChangeFcn(this.handleClassroomMessage());
      });

      this.sessionController = new SessionController(this.sessionContentSources, 60 * this.sessionTimeLimit);
      this.sessionController.sessionRecord = this.sessionRecord;

      await this.sessionController.prepareSession();
      this._intervalHandler = setInterval(this.tick, 1000);

      this.sessionPrepared = true;

      sources
        .filter((s) => s.type === 'course')
        .forEach(async (c) => (this.courseNames[c.id] = await getCourseName(c.id)));

      console.log(`[Study] Session created:
        ${this.sessionController.toString()}
        User courses: ${sources
          .filter((s) => s.type === 'course')
          .map((c) => c.id)
          .toString()}
        User classrooms: ${sessionClassroomDBs.map((db) => db._id)}
      `);

      this.inSession = true;
      this.loadCard(this.sessionController.nextCard());
    },

    registerUserForPreviewCourse() {
      this.user!.registerForCourse(this.previewCourseConfig!.courseID!).then(() =>
        (this.router as Router).push(`/quilts/${this.previewCourseConfig!.courseID!}`)
      );
    },

    countCardViews(course_id: string, card_id: string): number {
      return this.sessionRecord.filter((r) => r.card.course_id === course_id && r.card.card_id === card_id).length;
    },

    async processResponse(this: StudyInstance, r: CardRecord) {
      this.$emit('emitResponse', r);

      this.timerIsActive = false;

      r.cardID = this.cardID;
      r.courseID = this.courseID;
      this.currentCard.records.push(r);

      console.log(`[Study] Study.processResponse is running...`);
      const cardHistory = this.logCardRecord(r);

      if (isQuestionRecord(r)) {
        console.log(`[Study] Question is ${r.isCorrect ? '' : 'in'}correct`);
        if (r.isCorrect) {
          try {
            if (this.$refs.shadowWrapper) {
              this.$refs.shadowWrapper.setAttribute(
                'style',
                `--r: ${255 * (1 - (r.performance as number))}; --g:${255}`
              );
              this.$refs.shadowWrapper.classList.add('correct');
            }
          } catch (e) {
            // swallow error
          }

          if (this.configStore?.config.likesConfetti) {
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
            this.loadCard(this.sessionController!.nextCard('dismiss-success'));

            cardHistory.then((history: CardHistory<CardRecord>) => {
              this.scheduleReview(history, item);
              if (history.records.length === 1) {
                this.updateUserAndCardElo(0.5 + (r.performance as number) / 2, this.courseID, this.cardID);
              } else {
                const k = Math.ceil(32 / history.records.length);
                this.updateUserAndCardElo(0.5 + (r.performance as number) / 2, this.courseID, this.cardID, k);
              }
            });
          } else {
            this.loadCard(this.sessionController!.nextCard('marked-failed'));
          }
        } else {
          try {
            if (this.$refs.shadowWrapper) {
              this.$refs.shadowWrapper.classList.add('incorrect');
            }
          } catch (e) {
            // swallow error
          }

          cardHistory.then((history: CardHistory<CardRecord>) => {
            if (history.records.length !== 1 && r.priorAttemps === 0) {
              this.updateUserAndCardElo(0, this.courseID, this.cardID);
            }
          });

          if (isQuestionView(this.constructedView)) {
            if (this.currentCard.records.length >= this.constructedView.maxAttemptsPerView) {
              const sessionViews: number = this.countCardViews(this.courseID, this.cardID);
              if (sessionViews >= this.constructedView.maxSessionViews) {
                this.loadCard(this.sessionController!.nextCard('dismiss-failed'));
                this.updateUserAndCardElo(0, this.courseID, this.cardID);
              } else {
                this.loadCard(this.sessionController!.nextCard('marked-failed'));
              }
            }
          }
        }
      } else {
        this.loadCard(this.sessionController!.nextCard('dismiss-success'));
      }

      this.clearFeedbackShadow();
    },

    async updateUserAndCardElo(userScore: number, course_id: string, card_id: string, k?: number) {
      const userElo = toCourseElo(this.userCourseRegDoc!.courses.find((c) => c.courseID === course_id)!.elo);
      const cardElo = (
        await new CourseDB(this.currentCard.card.course_id).getCardEloData([this.currentCard.card.card_id])
      )[0];

      if (cardElo && userElo) {
        const eloUpdate = adjustCourseScores(userElo, cardElo, userScore);
        this.userCourseRegDoc!.courses.find((c) => c.courseID === course_id)!.elo = eloUpdate.userElo;

        Promise.all([
          updateUserElo(this.user!.username, course_id, eloUpdate.userElo),
          updateCardElo(course_id, card_id, eloUpdate.cardElo),
        ]).then((results) => {
          const user = results[0];
          const card = results[1];

          if (user.ok && card && card.ok) {
            console.log(
              `[Study] Updated ELOS:
              \tUser: ${JSON.stringify(eloUpdate.userElo)})
              \tCard: ${JSON.stringify(eloUpdate.cardElo)})
              `
            );
          }
        });
      }
    },

    clearFeedbackShadow() {
      setTimeout(() => {
        try {
          if (this.$refs.shadowWrapper) {
            (this.$refs.shadowWrapper as any).classList.remove('correct', 'incorrect');
          }
        } catch (e) {
          // swallow error
        }
      }, 1250);
    },

    async logCardRecord(r: CardRecord): Promise<CardHistory<CardRecord>> {
      return await putCardRecord(r, this.user!.username);
    },

    async scheduleReview(history: CardHistory<CardRecord>, item: StudySessionItem) {
      const nextInterval = newInterval(history);
      const nextReviewTime = moment.utc().add(nextInterval, 'seconds');

      if (isReview(item)) {
        console.log(`[Study] Removing previously scheduled review for: ${item.cardID}`);
        removeScheduledCardReview(this.user!.username, item.reviewID);
      }

      scheduleCardReview({
        user: this.user!.username,
        course_id: history.courseID,
        card_id: history.cardID,
        time: nextReviewTime,
        scheduledFor: item.contentSourceType,
        schedulingAgentId: item.contentSourceID,
      });
    },

    async loadCard(item: StudySessionItem | null) {
      if (this.loading) {
        console.warn(`Attempted to load card while loading another...`);
        return;
      }

      console.log(`[Study] loading: ${JSON.stringify(item)}`);
      if (item === null) {
        this.sessionFinished = true;
        return;
      }
      this.cardType = item.status;

      const qualified_id = item.qualifiedID;
      this.loading = true;
      const _courseID = qualified_id.split('-')[0];
      const _cardID = qualified_id.split('-')[1];
      const _cardElo = qualified_id.split('-')[2];

      console.log(`[Study] Now displaying: ${qualified_id}`);

      try {
        const tmpCardData = await getCourseDoc<CardData>(_courseID, _cardID);

        if (!isCourseElo(tmpCardData.elo)) {
          tmpCardData.elo = toCourseElo(tmpCardData.elo);
        }

        const tmpView = Courses.getView(tmpCardData.id_view);
        const tmpDataDocs = tmpCardData.id_displayable_data.map((id) => {
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
        this.card_elo = tmpCardData.elo.global.score;

        // [ ] #vue3 - remove after migration
        // if (isVueConstructor(tmpView)) {
        //   // @ts-ignore
        //   this.constructedView = new tmpView() as Viewable;
        // } else

        if (isDefineComponent(tmpView)) {
          // @ts-ignore
          this.constructedView = tmpView;
        } else {
          console.warn(`[Study] Error constructing view for ${qualified_id}`);
          // @ts-ignore
          this.constructedView = tmpView;
        }

        this.sessionRecord.push({
          card: {
            course_id: _courseID,
            card_id: _cardID,
            card_elo: tmpCardData.elo.global.score,
          },
          item: item,
          records: [],
        });
      } catch (e) {
        console.warn(`[Study] Error loading card ${JSON.stringify(item)}:\n\t${JSON.stringify(e)}, ${e}`);
        this.loading = false;

        const err = e as Error;
        if (docIsDeleted(err) && isReview(item)) {
          console.warn(`Card was deleted: ${qualified_id}`);
          removeScheduledCardReview(this.user!.username, item.reviewID);
        }

        this.loadCard(this.sessionController!.nextCard('dismiss-error'));
      } finally {
        this.loading = false;
      }
    },
  },
});
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

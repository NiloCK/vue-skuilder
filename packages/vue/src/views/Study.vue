<template>
  <div v-if="!$store.state.views.study.inSession">
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
        <p>{{ sessionController.report }}</p>
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
            <v-icon v-if="timerIsActive" large dark>mdi-add</v-icon>
          </v-progress-circular>
        </v-btn>
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
import { displayableDataToViewData, ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable, { isQuestionView } from '@/base-course/Viewable';
import { getCourseDoc, putCardRecord, removeScheduledCardReview, scheduleCardReview } from '@/db';
import { ContentSourceID, getStudySource, isReview, StudyContentSource, StudySessionItem } from '@/db/contentSource';
import { getCredentialledCourseConfig } from '@/db/courseAPI';
import { getCourseList, getCourseName, updateCardElo, docIsDeleted } from '@/db/courseDB';
import { getCardDataShape } from '@/db/getCardDataShape';
import SessionController, { StudySessionRecord } from '@/db/SessionController';
import { newInterval } from '@/db/SpacedRepetition';
import { CardData, CardHistory, CardRecord, DisplayableData, isQuestionRecord } from '@/db/types';
import { adjustCourseScores, toCourseElo } from '@/tutor/Elo';
import confetti from 'canvas-confetti';
import moment from 'moment';
import { User, CourseRegistrationDoc } from '../db/userDB';
import { StudentClassroomDB } from '../db/classroomDB';
import { Status } from '../enums/Status';
import { CourseConfig } from '../server/types';
import { ViewComponent } from '@/base-course/Displayable';
import { randomInt } from '../courses/math/utility';

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

export default defineComponent({
  name: 'Study',
  
  components: {
    CardViewer: () => import('@/components/Study/CardViewer.vue'),
    CardLoader: () => import('@/components/Study/CardLoader.vue'), 
    SkldrControlsView: () => import('../components/SkMouseTrap.vue'),
    SkTagsInput: () => import('@/components/Edit/TagsInput.vue'),
    SessionConfiguration: () => import('@/components/Study/SessionConfiguration.vue'),
    HeatMap: () => import('@/components/HeatMap.vue')
  },

  props: {
    previewCourseID: String,
    randomPreview: Boolean,
    focusCourseID: String
  },

  data() {
    return {
      user: null as User | null,
      previewCourseConfig: undefined as CourseConfig | undefined,
      previewMode: false,
      fab: false,
      editTags: false,
      editCard: false,
      editCardReady: false,
      cardID: '',
      view: null as ViewComponent | null,
      constructedView: null as Viewable | null,
      data: [] as ViewData[],
      courseID: '',
      card_elo: 1000,
      courseNames: {} as Record<string, string>,
      cardCount: 1,
      sessionController: null as SessionController | null,
      sessionPrepared: false,
      sessionFinished: false,
      sessionRecord: [] as StudySessionRecord[],
      percentageRemaining: 100,
      timerIsActive: false,
      timeString: '',
      _intervalHandler: null as NodeJS.Timeout | null,
      loading: false,
      userCourseRegDoc: null as CourseRegistrationDoc | null,
      sessionContentSources: [] as StudyContentSource[],
      sessionClassroomDBs: [] as StudentClassroomDB[],
      sessionTimeLimit: 5,
      timeRemaining: 300,
      cardType: ''
    };
  },

  // Rest of the component implementation converted to Options API...
  // Methods, computed properties, watchers etc would follow here
  // Following same logic but with Options API syntax
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

<template>
  <div v-if='!updatePending'>
    <h1 class='display-1'><router-link to="/q">Quilts</router-link> / {{_courseConfig.name}}</h1>
    
    <div class="body-2">
      There are {{ questionCount }} exercises in this course.
    </div>

    <p class='body-2'>
      Course Description: {{_courseConfig.description}}
    </p>
    
    <transition name="component-fade" mode="out-in">
      <div v-if="userIsRegistered" >
        <v-btn color="error" @click="drop">Drop this course</v-btn>
      </div>
      <div v-else>
        <v-btn color="primary" @click="register">Register</v-btn>
        <router-link :to='`/q/${_id}/preview`'>
          <v-btn outline color="primary">Start a trial study session</v-btn>
        </router-link>
      </div>
    </transition>
    
    <midi-config :_id='_id' />

    <router-link
      :to='`/edit/${_id}`'
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
  </div>  
</template>

<script lang="ts">
import SkldrVue from "../../SkldrVue";
import Component from "vue-class-component";
import {
  CourseConfig,
  CreateCourse,
  ServerRequestType,
  DataShape55,
  QuestionType55,
  ClassroomConfig,
  CreateClassroom
} from "../../server/types";
import serverRequest from "../../server";
import { alertUser } from "../SnackbarService.vue";
import { Status } from "../../enums/Status";
import Mousetrap from "mousetrap";
import { log } from "util";
import moment from "moment";
import { registerUserForClassroom } from '../../db/userDB';
import TeacherClassroomDB, { getClassroomDB, CLASSROOM_CONFIG, AssignedContent } from '../../db/classroomDB';
import { Prop, Watch } from 'vue-property-decorator';
import { getCourseList, getCourseTagStubs, getCourseConfig } from '../../db/courseDB';
import { Tag, DocType } from '../../db/types';
import { getQuestions, getCourseDB } from '../../db';
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';

@Component({
  components: {
    MidiConfig
  }
})
export default class CourseInformation extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private mousetrap: MousetrapInstance = new Mousetrap(this.$el);


  private nameRules: Array<(value: string) => string | boolean> = [
    value => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    }
  ];

  private updatePending: boolean = true;

  private addingContent: boolean = false;
  private availableCourses: CourseConfig[] = [];
  private selectedCourse: string = '';
  private availableTags: Tag[] = [];
  private selectedTags: string[] = [];

  private _courseConfig: CourseConfig;
  public userIsRegistered: boolean = false;
  private questionCount: number;


  private async created() {
    const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    this.userIsRegistered = userCourses.courses.filter((c) => {
      return c.courseID === this._id && (c.status === 'active' || c.status === undefined)
    }).length === 1;
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.questionCount = (await db.find({
      selector: {
        docType: DocType.CARD
      }
    })).docs.length;
    this.updatePending = false;
  }

  private async register() {
    log(`Registering for ${this._id}`);
    const res = await this.$store.state._user!.registerForCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = true;
    }
    // this.userIsRegistered = !this.userIsRegistered;

  }
  private async drop() {
    log(`Dropping course ${this._id}`)
    const res = await this.$store.state._user!.dropCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = false;
    }
    // this.userIsRegistered = !this.userIsRegistered;
  }
}
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.5s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

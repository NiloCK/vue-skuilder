<template>
  <div v-if="!updatePending">
    <h1 class="display-1"><router-link to="/q">Quilts</router-link> / {{ _courseConfig.name }}</h1>

    <p class="body-2">
      {{ _courseConfig.description }}
    </p>

    <div class="body-2">{{ questionCount }} exercises</div>
    <div class="body-2">{{ tags.length }} tags</div>

    <!-- <div style='background-color: red; padding: 15px; margin: 10px;'>

      <v-text-field
        v-model="elo"
        label="elo"
        id="id"
        type='number'
      ></v-text-field>
      <v-text-field
        v-model="num"
        label="CardCount"
        id="id"
        type='number'
      ></v-text-field>
      <v-btn color="success" @click="getCards">GetCards!</v-btn>
    </div> -->

    <transition name="component-fade" mode="out-in">
      <div v-if="userIsRegistered">
        <router-link :to="`/study/${_id}`">
          <v-btn color="success">Start a study session</v-btn>
        </router-link>
        <router-link :to="`/edit/${_id}`">
          <v-btn dark color="indigo lighten-1" title="Add content to this course">
            <v-icon left>add</v-icon>
            Add content
          </v-btn>
        </router-link>
        <v-btn color="error" small outline @click="drop">Drop this course</v-btn>
        <div v-for="(tag, i) in tags" :key="i">
          <v-card>
            <v-card-text>
              <pre>
              {{
                  (() => {
                    let ret = '';
                    for (let i in tag) {
                      ret += `${i}: ${tag[i]}\n`;
                    }
                    return ret;
                  })()
                }}
              </pre>
            </v-card-text>
          </v-card>
          <!-- {{JSON.stringify(tag)}} -->
        </div>
      </div>
      <div v-else>
        <v-btn color="primary" @click="register">Register</v-btn>
        <router-link :to="`/q/${_id}/preview`">
          <v-btn outline color="primary">Start a trial study session</v-btn>
        </router-link>
      </div>
    </transition>

    <midi-config v-if="isPianoCourse" :_id="_id" />
  </div>
</template>

<script lang="ts">
import SkldrVue from '../../SkldrVue';
import Component from 'vue-class-component';
import {
  CourseConfig,
  CreateCourse,
  ServerRequestType,
  DataShape55,
  QuestionType55,
  ClassroomConfig,
  CreateClassroom,
} from '../../server/types';
import serverRequest from '../../server';
import { alertUser } from '../SnackbarService.vue';
import { Status } from '../../enums/Status';
import Mousetrap from 'mousetrap';
import { log } from 'util';
import moment from 'moment';
import { registerUserForClassroom } from '../../db/userDB';
import TeacherClassroomDB, { getClassroomDB, CLASSROOM_CONFIG, AssignedContent } from '../../db/classroomDB';
import { Prop, Watch } from 'vue-property-decorator';
import { getCourseList, getCourseTagStubs, getCourseConfig, CourseDB } from '../../db/courseDB';
import { Tag, DocType } from '../../db/types';
import { getCourseDB } from '../../db';
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';

@Component({
  components: {
    MidiConfig,
  },
})
export default class CourseInformation extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private mousetrap: MousetrapInstance = new Mousetrap(this.$el);

  private get isPianoCourse(): boolean {
    return this._courseConfig.name.toLowerCase().includes('piano');
  }

  private tagStr(t: Tag) {}

  private nameRules: Array<(value: string) => string | boolean> = [
    (value) => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    },
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
  private tags: Tag[] = [];

  private async created() {
    const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    this.userIsRegistered =
      userCourses.courses.filter((c) => {
        return c.courseID === this._id && (c.status === 'active' || c.status === undefined);
      }).length === 1;
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.questionCount = (
      await db.find({
        selector: {
          docType: DocType.CARD,
        },
        limit: 1000,
      })
    ).docs.length;
    this.tags = (await getCourseTagStubs(this._id)).rows.map((r) => r.doc!);
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
    log(`Dropping course ${this._id}`);
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

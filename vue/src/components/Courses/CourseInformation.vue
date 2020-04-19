<template>
  <div v-if='!updatePending'>
    <h1 class='display-1'><router-link to="/q">Quilts</router-link> / {{_courseConfig.name}}</h1>
    
    <div class="body-2">
      There are {{ questionCount }} questions in this course.
    </div>

    <p class='body-2'>
      Course Description: {{_courseConfig.description}}
    </p>
    
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

  private _courseConfig: CourseConfig;
  private questionCount: number;

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

  private async created() {
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.questionCount = (await db.find({
      selector: {
        docType: DocType.CARD
      }
    })).docs.length;
    this.updatePending = false;
  }


}
</script>

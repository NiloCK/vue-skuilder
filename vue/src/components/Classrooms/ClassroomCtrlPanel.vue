<template>
  <div v-if='!updatePending'>
      
    
        <h1><router-link to="/classrooms">My Classrooms</router-link> / {{_classroomCfg.name}}</h1>

        <h3>Join code: {{_classroomCfg.joinCode}}</h3>
        <v-layout wrap column>
          
          <v-flex xs12 sm6 md4>
            <v-checkbox
              label="Allow peer instruction"
              v-model="_classroomCfg.peerAssist"
              :value="true"></v-checkbox>
          </v-flex>
          <div v-if="classroomDB.ready">

            <h2>Assigned Content:</h2>
            <h3>Quilts:</h3>
            <ul></ul>
            <ul>
              <li v-for="c in _assignedCourses" :key="c._id">
                {{c.courseID}} <a @click="removeContent(c)">Remove</a>
              </li>
            </ul>
            <h3>Tags:</h3>
            <ul>
              <li v-for="c in _assignedTags" :key="c._id">
                {{c.courseID}} - {{ c.tagID}}  <a @click="removeContent(c)">Remove</a>
              </li>
            </ul>
            <v-btn 
              transition="scale-transition"
              v-if='!addingContent'
              color="primary"
              @click='addingContent = true;'    
            >
              Assign New Content
              <v-icon right dark>add</v-icon>
            </v-btn>
            <v-card 
            v-if='addingContent'>
              <v-toolbar>
                <v-toolbar-title>Add Content</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="addingContent = false;" right small dark icon color="error" >
                  <v-icon>close</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                
              <v-select
                label="Select Quilt"
                :items="availableCourses"
                v-model="selectedCourse"
                autocomplete
                item-text='name'
                item-value='_id'
                title="Select Quilt"
              ></v-select>
              
              <v-select
                label="Select Tags"
                :items="availableTags"
                item-text='name'
                item-value='name'
                v-model="selectedTags"
                multiple
                chips
                hint=""
                persistent-hint
              ></v-select>
              
              </v-card-text>

              
              <v-card-actions>
                <v-btn 
                  v-if='selectedCourse !== ""'
                  color="primary"
                  @click="assignContent"
                >
                  {{ selectedTags.length == 0 ? 'Add Entire Quilt' : 'Add Tags'}}
                  <v-icon flat right dark>add</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-layout> 
    
  </div>  
</template>

<script lang="ts">
import Vue from "vue";
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
import { getCourseList, getCourseTagStubs } from '../../db/courseDB';
import { Tag } from '../../db/types';

@Component({})
export default class ClassroomCtrlPanel extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private mousetrap: MousetrapInstance = new Mousetrap(this.$el);

  private: PouchDB.Database;
  private _classroomCfg: ClassroomConfig;

  private classroomDB: TeacherClassroomDB;

  private _assignedContent: AssignedContent[];
  private get _assignedCourses() {
    return this._assignedContent.filter((c) => {
      return c.type === 'course';
    });
  }
  private get _assignedTags() {
    return this._assignedContent.filter((c) => {
      return c.type === 'tag';
    });
  }

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
    this.classroomDB = await TeacherClassroomDB.factory(this._id);
    Promise.all([
      this._assignedContent = await this.classroomDB.getAssignedContent(),
      this._classroomCfg = await this.classroomDB.getConfig()
    ]);
    log(`Route loaded w/ (prop) _id: ${this._id}`);
    log(`Config: 
    ${JSON.stringify(this._classroomCfg)}`);

    this.availableCourses = (await getCourseList()).rows.map(r => r.doc!);

    this.updatePending = false;
  }

  @Watch('selectedCourse')
  private async getCourseTags() {
    let tags = (await getCourseTagStubs(this.selectedCourse))
      .rows
      .map((row) => row.doc!);
    this.availableTags = tags;
  }

  private async assignContent() {
    if (this.selectedTags.length === 0) {
      await this.classroomDB.assignContent({
        type: 'course',
        courseID: this.selectedCourse,
        assignedBy: this.$store.state.user
      });
    } else {
      await this.selectedTags.forEach((tag) => {
        this.classroomDB.assignContent({
          type: 'tag',
          courseID: this.selectedCourse,
          tagID: tag,
          assignedBy: this.$store.state.user,
        })
      })
    }

    this._assignedContent = await this.classroomDB.getAssignedContent();
    this.addingContent = false;
    this.selectedCourse = '';
    this.selectedTags = [];
    this.availableTags = [];
  }
  private async removeContent(c: AssignedContent) {
    this.classroomDB.removeContent(c);
  }

  private async submit() {
    this.updatePending = true;
  }
}
</script>

<template>
  <v-container fluid>
    
  <v-layout row wrap justify-space-around>
    <v-flex md4 sm12 xs12>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>My Registered Courses</v-toolbar-title>
        </v-toolbar>

        <v-list >
          <template v-for="course in registeredCourses">
            
            <v-list-tile
              :key="course._id"
              avatar
            >

              <v-list-tile-content>
                <v-list-tile-title>
                  {{ course.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="secondary"
                 @click="dropCourse(course._id)"
                 :loading="spinnerMap[course._id] !== undefined"
                >
                  Drop
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </v-list>
      </v-card>

      
    </v-flex>
    <!-- <v-spacer></v-spacer> -->
    <v-flex md4 sm12 xs12>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>Available Courses</v-toolbar-title>
        </v-toolbar>

        <v-list >
          <template v-for="course in availableCourses">
            
            <v-list-tile
              :key="course._id"
              avatar
              transition="fade-transition"
            >

              <v-list-tile-content>
                <v-list-tile-title>
                  {{ course.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="primary"
                 @click="addCourse(course._id)"
                 :loading="spinnerMap[course._id] !== undefined"
                >
                  Register
                </v-btn>
              </v-list-tile-action>
              
            </v-list-tile>
          </template>
          <v-divider></v-divider>
            <v-dialog
              v-model="newCourseDialog"
              fullscreen
              
              transition="dialog-bottom-transition"
              :overlay="false"
            >
              <v-btn color="primary" dark slot="activator">New Course</v-btn>
                <course-editor 
                 v-on:CourseEditingComplete="processResponse($event)"
                />
            </v-dialog>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '@/components/Courses/CourseEditor.vue';
import { Component } from 'vue-property-decorator';
import CourseList from '../courses';
import _ from 'lodash';
import { log } from 'util';
import serverRequest from '../server';
import { ServerRequestType, CourseConfig } from '../server/types';
import SkldrVue from '../SkldrVue';
import { alertUser } from '../components/SnackbarService.vue';
import { getCourseList } from '@/db/courseDB';
import { registerUserForCourse, getUserCourses, dropUserFromCourse } from '../db/userDB';

@Component({
  components: {
    CourseEditor
  }
})
export default class Courses extends SkldrVue {
  public existingCourses: CourseConfig[] = [];
  public registeredCourses: CourseConfig[] = [];
  private awaitingCreateCourse: boolean = false;
  private spinnerMap: { [key: string]: boolean } = {};

  private newCourseDialog: boolean = false;

  public get availableCourses() {
    return _.without(this.existingCourses, ...this.registeredCourses).filter((course) => {
      const user = this.$store.state.user;
      const viewable: boolean =
        course.public ||
        course.creator === user ||
        course.admins.indexOf(user) !== -1 ||
        course.moderators.indexOf(user) !== -1;

      return viewable;
    });
  }

  private processResponse(event: string) {
    this.newCourseDialog = false;
    this.refreshData();
  }

  private async refreshData() {
    log(`Pulling user course data...`);
    const courseList = await getCourseList();
    const userCoursIDs = (await getUserCourses(this.$store.state.user)).courses.map((course) => {
      return course.courseID;
    });

    this.existingCourses = courseList.rows.map((course) => {
      return course.doc!;
    });

    this.registeredCourses = courseList.rows.filter((course) => {
      let match: boolean = false;
      userCoursIDs.forEach((id) => {
        if (course.id === id) {
          match = true;
        }
      });
      return match;
    }).map((course) => {
      return course.doc!;
    });
  }

  private async created() {
    this.refreshData();
  }

  private async createCourse() {
    this.awaitingCreateCourse = true;
    const resp = await serverRequest({
      type: ServerRequestType.CREATE_COURSE,
      data: {
        name: 'testCourseName',
        description: 'All of these courses will be the same!',
        public: true,
        deleted: false,
        creator: this.$store.state.user,
        admins: [this.$store.state.user],
        moderators: [],
        dataShapes: [],
        questionTypes: []
      },
      user: this.$store.state.user,
      response: null
    });

    alertUser({
      status: resp.response!,
      text: `Course ${JSON.stringify(resp)} created`
    });
    this.awaitingCreateCourse = false;
  }

  private async addCourse(course: string) {
    this.$set(this.spinnerMap, course, true);
    log(`Attempting to register for ${course}.`);
    await registerUserForCourse(this.$store.state.user, course);
    this.$set(this.spinnerMap, course, undefined);
    this.refreshData();
  }
  private async dropCourse(course: string) {
    this.$set(this.spinnerMap, course, true);
    log(`Attempting to drop ${course}.`);
    await dropUserFromCourse(this.$store.state.user, course);
    this.$set(this.spinnerMap, course, undefined);
    this.refreshData();
  }
}
</script>

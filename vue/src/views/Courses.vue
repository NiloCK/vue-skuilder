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
              :key="course"
              avatar
              @click="log('asof')"
            >

              <v-list-tile-content>
                <v-list-tile-title v-html="course"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="secondary"
                 @click="dropCourse(course)"
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
              :key="course"
              avatar
            >

              <v-list-tile-content>
                <v-list-tile-title v-html="course"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="primary"
                 @click="addCourse(course)"
                >
                  Register
                </v-btn>
              </v-list-tile-action>
              
            </v-list-tile>
          </template>
          <v-divider></v-divider>
          <v-btn
            color="primary"
            :loading="awaitingCreateCourse"
            @click="createCourse()"
          >
            New Course
            <v-icon right>add_circle</v-icon>
          </v-btn>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import { Component } from 'vue-property-decorator';
import CourseList from '../courses';
import _ from 'lodash';
import { log } from 'util';
import serverRequest from '../server';
import { ServerRequestType, CourseConfig } from '../server/types';
import SkldrVue from '../SkldrVue';
import { alertUser } from '../components/SnackbarService.vue';
import ENV from '../ENVIRONMENT_VARS';
import pouch from 'pouchdb-browser';

@Component({
  components: {
    CourseEditor
  }
})
export default class Courses extends SkldrVue {
  private courseLookupDB: PouchDB.Database = new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' +
    ENV.COUCHDB_SERVER_URL + 'coursedb-lookup'
  );
  private existingCourses: CourseConfig[] = [];
  private registeredCourses: string[] = ['sample', 'course', 'data', 'math'];
  private awaitingCreateCourse: boolean = false;

  public get availableCourses() {
    // return _.without(this.existingCourses, ...this.registeredCourses);
    return this.existingCourses.map((course) => course.name);
  }

  private created() {
    // CourseList.courses.map((course) => {
    //   return course.name;
    // });
    this.courseLookupDB.allDocs<CourseConfig>({
      include_docs: true
    }).then((docs) => {
      docs.rows.forEach((course) => {
        if (course.doc!.public) {
          this.existingCourses.push(course.doc!);
        }
      });
    });
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
        moderators: []
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

  private addCourse(course: string) {
    log(`Attempting to register for ${course}.`);
  }
  private dropCourse(course: string) {
    log(`Attempting to drop ${course}.`);
  }
}
</script>

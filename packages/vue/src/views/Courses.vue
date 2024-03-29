<template>
  <v-container fluid>
    <v-layout row wrap justify-space-around>
      <v-flex md4 sm12 xs12>
        <v-card>
          <v-toolbar flat>
            <v-toolbar-title>My Registered Quilts</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in" key="registered">
              <template v-for="course in registeredCourses">
                <v-list-tile :key="course._id" avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <router-link :to="`/q/${course.name.replace(' ', '_')}`">
                        {{ course.name }}
                      </router-link>
                      <v-icon v-if="!course.public">visibility_off</v-icon>
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
            </transition-group>
          </v-list>
        </v-card>
      </v-flex>
      <!-- <v-spacer></v-spacer> -->
      <!-- <v-flex xs12 md4>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>Available Courses</v-toolbar-title>
        </v-toolbar>

        <v-list >
            <transition-group
              appear
              name='component-fade'
              mode='out-in'
              key='available'
              tag='div'
            >
          <template v-for="course in availableCourses">
            
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
                 color="primary"
                 @click="addCourse(course._id)"
                 :loading="spinnerMap[course._id] !== undefined"
                >
                  Register
                </v-btn>
              </v-list-tile-action>
              
            </v-list-tile>
          </template>
          </transition-group>
          <v-divider></v-divider>
            
        </v-list>
      </v-card>
    </v-flex> -->
    </v-layout>

    <h1 class="display-1">Available Quilts:</h1>
    <v-layout align-space-between fill-height wrap>
      <v-flex fill-height pa-2 xs12 sm6 md4 lg3 v-for="course in availableCourses" :key="course._id">
        <course-stub-card v-on:refresh="refreshData" :_id="course._id" />
      </v-flex>
    </v-layout>
    <v-dialog v-model="newCourseDialog" fullscreen transition="dialog-bottom-transition" :overlay="false">
      <v-btn color="primary" dark slot="activator">Start a new Quilt</v-btn>
      <course-editor v-on:CourseEditingComplete="processResponse($event)" />
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '@/components/Courses/CourseEditor.vue';
import CourseStubCard from '@/components/Courses/CourseStubCard.vue';
import { Component } from 'vue-property-decorator';
import CourseList from '../courses';
import _ from 'lodash';
import { log } from 'util';
import serverRequest from '../server';
import { ServerRequestType, CourseConfig } from '../server/types';
import SkldrVue from '../SkldrVue';
import { alertUser } from '../components/SnackbarService.vue';
import { getCourseList } from '@/db/courseDB';
import { User } from '../db/userDB';

@Component({
  components: {
    CourseEditor,
    CourseStubCard,
  },
})
export default class Courses extends SkldrVue {
  public existingCourses: CourseConfig[] = [];
  public registeredCourses: CourseConfig[] = [];
  private awaitingCreateCourse: boolean = false;
  private spinnerMap: { [key: string]: boolean } = {};

  private newCourseDialog: boolean = false;

  public get availableCourses() {
    const availableCourses = _.without(this.existingCourses, ...this.registeredCourses);
    const viewableCourses = availableCourses.filter((course) => {
      const user = this.$store.state._user!.username;
      const viewable: boolean =
        course.public ||
        course.creator === user ||
        course.admins.indexOf(user) !== -1 ||
        course.moderators.indexOf(user) !== -1;

      return viewable;
    });

    return viewableCourses;
  }

  private processResponse(event: string) {
    this.newCourseDialog = false;
    this.refreshData();
  }

  private async refreshData() {
    log(`Pulling user course data...`);
    const userCourseIDs = (await this.$store.state._user!.getRegisteredCourses())
      .filter((c) => {
        return c.status === 'active' || c.status === 'maintenance-mode' || c.status === undefined;
      })
      .map((c) => {
        return c.courseID;
      });
    const courseList = await getCourseList();

    this.existingCourses = courseList.rows
      .filter((course) => {
        return course && course.doc;
      })
      .map((course) => {
        return course.doc!;
      });

    this.registeredCourses = courseList.rows
      .filter((course) => {
        let match: boolean = false;
        userCourseIDs.forEach((id) => {
          if (course.id === id) {
            match = true;
          }
        });
        return match;
      })
      .map((course) => {
        return course.doc!;
      });
  }

  private async created() {
    this.refreshData();
    // this.$on('refresh', () => {
    //   this.refreshData();
    // });
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
        creator: this.$store.state._user!.username,
        admins: [this.$store.state._user!.username],
        moderators: [],
        dataShapes: [],
        questionTypes: [],
      },
      user: this.$store.state._user!.username,
      response: null,
    });

    alertUser({
      status: resp.response!,
      text: `Course ${JSON.stringify(resp)} created`,
    });
    this.awaitingCreateCourse = false;
  }

  private async addCourse(course: string) {
    this.$set(this.spinnerMap, course, true);
    log(`Attempting to register for ${course}.`);
    await this.$store.state._user!.registerForCourse(course);
    this.$set(this.spinnerMap, course, undefined);
    this.refreshData();
  }
  private async dropCourse(course: string) {
    this.$set(this.spinnerMap, course, true);
    log(`Attempting to drop ${course}.`);
    await this.$store.state._user!.dropCourse(course);
    this.$set(this.spinnerMap, course, undefined);
    this.refreshData();
  }
}
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: all 0.65s ease;
}
.component-fade-enter,
.component-fade-leave-to {
  opacity: 0;
}
.componnent-fade-move {
  transition: transform 1s;
}
</style>

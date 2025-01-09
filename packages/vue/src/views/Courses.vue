<template>
  <v-container fluid>
    <v-row justify="space-around">
      <v-col cols="12" sm="12" md="4">
        <v-card>
          <v-toolbar flat>
            <v-toolbar-title>My Registered Quilts</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in" key="registered">
              <template v-for="course in registeredCourses">
                <v-list-item :key="course._id" avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      <router-link :to="`/q/${course.name.replace(' ', '_')}`">
                        {{ course.name }}
                      </router-link>
                      <v-icon v-if="!course.public">visibility_off</v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      small
                      color="secondary"
                      @click="dropCourse(course._id)"
                      :loading="spinnerMap[course._id] !== undefined"
                    >
                      Drop
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </transition-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <h1 class="display-1">Available Quilts:</h1>
    <v-row align="space-between" class="fill-height" wrap>
      <v-col
        class="fill-height pa-2"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="course in availableCourses"
        :key="course._id"
      >
        <course-stub-card v-on:refresh="refreshData" :_id="course._id" />
      </v-col>
    </v-row>
    <v-dialog v-model="newCourseDialog" fullscreen transition="dialog-bottom-transition" :overlay="false">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on"> Start a new Quilt </v-btn>
      </template>
      <course-editor v-on:CourseEditingComplete="processResponse($event)" />
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CourseEditor from '@/components/Courses/CourseEditor.vue';
import CourseStubCard from '@/components/Courses/CourseStubCard.vue';
import CourseList from '../courses';
import _ from 'lodash';
import { log } from 'util';
import serverRequest from '../server';
import { ServerRequestType, CourseConfig } from '../server/types';
import { alertUser } from '../components/SnackbarService.vue';
import { getCourseList } from '@/db/courseDB';
import { User } from '../db/userDB';

export default defineComponent({
  name: 'Courses',
  
  components: {
    CourseEditor,
    CourseStubCard,
  },

  data() {
    return {
      existingCourses: [] as CourseConfig[],
      registeredCourses: [] as CourseConfig[],
      awaitingCreateCourse: false,
      spinnerMap: {} as { [key: string]: boolean },
      newCourseDialog: false,
      user: null as User | null
    }
  },

  computed: {
    availableCourses(): CourseConfig[] {
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
  },

  methods: {
    processResponse(event: string) {
      this.newCourseDialog = false;
      this.refreshData();
    },

    async refreshData() {
      log(`Pulling user course data...`);
      const userCourseIDs = (await this.user!.getRegisteredCourses())
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
    },

    async createCourse() {
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
    },

    async addCourse(course: string) {
      this.$set(this.spinnerMap, course, true);
      log(`Attempting to register for ${course}.`);
      await this.$store.state._user!.registerForCourse(course);
      this.$set(this.spinnerMap, course, undefined);
      this.refreshData();
    },

    async dropCourse(course: string) {
      this.$set(this.spinnerMap, course, true);
      log(`Attempting to drop ${course}.`);
      await this.$store.state._user!.dropCourse(course);
      this.$set(this.spinnerMap, course, undefined);
      this.refreshData();
    }
  },

  async created() {
    this.user = await User.instance();
    this.refreshData();
  }
});
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

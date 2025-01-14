<template>
  <div v-if="!updatePending">
    <h1><router-link to="/classrooms">My Classrooms</router-link> / {{ _classroomCfg.name }}</h1>

    <h3>
      Join code: {{ _classroomCfg.joinCode }}
      <router-link :to="`/classrooms/${_id}/code`">
        <v-btn x-small icon color="accent" alt="Make Fullscreen">
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
      </router-link>
    </h3>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox label="Allow peer instruction" v-model="_classroomCfg.peerAssist" :value="true"></v-checkbox>
      </v-col>
      <v-col v-if="classroomDB.ready" cols="12">
        <h2>Assigned Content:</h2>
        <h3>Quilts:</h3>
        <ul></ul>
        <ul>
          <li v-for="c in _assignedCourses" :key="c.courseID">
            {{ c.courseID }} <a @click="removeContent(c)">Remove</a>
          </li>
        </ul>
        <h3>Tags:</h3>
        <ul>
          <li v-for="(c, i) in _assignedTags" :key="i">
            {{ c.courseID }} - {{ c.tagID }} <a @click="removeContent(c)">Remove</a>
          </li>
        </ul>
        <v-fade-transition>
          <v-btn v-if="!addingContent" color="primary" @click="addingContent = true">
            Assign New Content
            <v-icon right>mdi-plus</v-icon>
          </v-btn>
        </v-fade-transition>
        <v-card v-if="addingContent">
          <v-app-bar>
            <v-toolbar-title>Add Content</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="error" @click="addingContent = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-app-bar>
          <v-card-text>
            <v-select
              label="Select Quilt"
              :items="availableCourses"
              v-model="selectedCourse"
              item-text="name"
              item-value="_id"
              title="Select Quilt"
            ></v-select>

            <v-select
              label="Select Tags"
              :items="availableTags"
              item-text="name"
              item-value="name"
              v-model="selectedTags"
              multiple
              chips
              hint=""
              persistent-hint
            ></v-select>
          </v-card-text>

          <v-card-actions>
            <v-btn v-if="selectedCourse !== ''" color="primary" @click="assignContent">
              {{ selectedTags.length == 0 ? 'Add Entire Quilt' : 'Add Tags' }}
              <v-icon right>mdi-plus</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import TeacherClassroomDB, { AssignedContent, AssignedTag } from '@/db/classroomDB';
import { getCourseList, getCourseTagStubs } from '@/db/courseDB';
import { Tag } from '@/db/types';
import { ClassroomConfig, CourseConfig } from '@/server/types';
import Vue from 'vue';
import { User } from '@/db/userDB';

export default Vue.extend({
  name: 'ClassroomCtrlPanel',

  props: {
    _id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      _classroomCfg: null as ClassroomConfig | null,
      classroomDB: null as TeacherClassroomDB | null,
      _assignedContent: [] as AssignedContent[],
      nameRules: [
        (value: string): string | boolean => {
          const max = 30;
          return value.length > max ? `Course name must be ${max} characters or less` : true;
        },
      ],
      updatePending: true,
      addingContent: false,
      availableCourses: [] as CourseConfig[],
      selectedCourse: '',
      availableTags: [] as Tag[],
      selectedTags: [] as string[],
    };
  },

  computed: {
    _assignedCourses(): AssignedContent[] {
      return this._assignedContent.filter((c) => c.type === 'course');
    },
    _assignedTags(): AssignedTag[] {
      return this._assignedContent.filter((c) => c.type === 'tag') as AssignedTag[];
    },
  },

  watch: {
    async selectedCourse() {
      const tags = (await getCourseTagStubs(this.selectedCourse)).rows.map((row) => row.doc!);
      this.availableTags = tags;
    },
  },

  async created() {
    this.classroomDB = await TeacherClassroomDB.factory(this._id);
    this._assignedContent = await this.classroomDB.getAssignedContent();
    this._classroomCfg = this.classroomDB.getConfig();

    console.log(`[ClassroomCtrlPanel] Route loaded w/ (prop) _id: ${this._id}`);
    console.log(`[ClassroomCtrlPanel] Config: ${JSON.stringify(this._classroomCfg)}`);

    this.availableCourses = (await getCourseList()).rows.map((r) => r.doc!);
    this.updatePending = false;
  },

  methods: {
    async assignContent() {
      if (!this.classroomDB) return;
      const u = await User.instance();

      if (this.selectedTags.length === 0) {
        await this.classroomDB.assignContent({
          assignedOn: moment(),
          activeOn: moment(),
          type: 'course',
          courseID: this.selectedCourse,
          assignedBy: u.username,
        });
      } else {
        await Promise.all(
          this.selectedTags.map((tag) =>
            this.classroomDB!.assignContent({
              assignedOn: moment(),
              activeOn: moment(),
              type: 'tag',
              courseID: this.selectedCourse,
              tagID: tag,
              assignedBy: u.username,
            })
          )
        );
      }

      this._assignedContent = await this.classroomDB.getAssignedContent();
      this.addingContent = false;
      this.selectedCourse = '';
      this.selectedTags = [];
      this.availableTags = [];
    },

    async removeContent(c: AssignedContent) {
      if (this.classroomDB) {
        await this.classroomDB.removeContent(c);
      }
    },

    async submit() {
      this.updatePending = true;
    },
  },
});
</script>

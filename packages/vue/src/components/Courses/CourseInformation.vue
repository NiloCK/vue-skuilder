<template>
  <div v-if="!updatePending">
    <h1 class="text-h4"><router-link to="/q">Quilts</router-link> / {{ _courseConfig.name }}</h1>

    <p class="text-body-2">
      {{ _courseConfig.description }}
    </p>

    <transition name="component-fade" mode="out-in">
      <div v-if="userIsRegistered">
        <router-link :to="`/study/${_id}`" class="mr-2">
          <v-btn color="success">Start a study session</v-btn>
        </router-link>
        <router-link :to="`/edit/${_id}`" class="mr-2">
          <v-btn dark color="indigo lighten-1" title="Add content to this course">
            <v-icon left>mdi-plus</v-icon>
            Add content
          </v-btn>
        </router-link>
        <router-link :to="`/courses/${_id}/elo`" class="mr-2">
          <v-btn dark color="green darken-2" title="Rank course content for difficulty">
            <v-icon left>mdi-format-list-numbered</v-icon>
            Arrange
          </v-btn>
        </router-link>
        <v-btn color="error" small outlined @click="drop">Drop this course</v-btn>
      </div>
      <div v-else>
        <v-btn color="primary" @click="register">Register</v-btn>
        <router-link :to="`/q/${_id}/preview`">
          <v-btn outlined color="primary">Start a trial study session</v-btn>
        </router-link>
      </div>
    </transition>
    <midi-config v-if="isPianoCourse" :_id="_id" />

    <v-card class="my-2">
      <v-app-bar dense>
        <v-toolbar-title>Tags</v-toolbar-title>
        <v-spacer></v-spacer>
        {{ tags.length }}
      </v-app-bar>
      <v-card-text>
        <v-chip outlined v-for="(tag, i) in tags" v-bind:key="i" class="mr-2 mb-2">
          <!-- todo: -->
          <!-- <router-link :to="`/q/${_courseConfig.name}/tags/${tag.name}`"> -->
          <router-link :to="`/q/${_id}/tags/${tag.name}`">
            {{ tag.name }}
          </router-link>
        </v-chip>
      </v-card-text>
    </v-card>

    <course-card-browser class="my-3" v-bind:_id="_id" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';
import { log } from 'util';
import { getCourseDB } from '@/db';
import { CourseDB, getCourseConfig, getCourseTagStubs } from '@/db/courseDB';
import { Tag } from '@/db/types';
import { CourseConfig } from '@/server/types';
import CourseCardBrowser from './CourseCardBrowser.vue';
import { User } from '@/db/userDB';

export default defineComponent({
  name: 'CourseInformation',
  
  components: { 
    MidiConfig, 
    CourseCardBrowser 
  },

  props: {
    _id: {
      type: String as PropType<string>,
      required: true
    }
  },

  data() {
    return {
      courseDB: null as CourseDB | null,
      nameRules: [
        (value: string): string | boolean => {
          const max = 30;
          return value.length > max ? `Course name must be ${max} characters or less` : true;
        }
      ],
      updatePending: true,
      _courseConfig: {} as CourseConfig,
      userIsRegistered: false,
      tags: [] as Tag[],
      user: null as User | null
    };
  },

  computed: {
    isPianoCourse(): boolean {
      return this._courseConfig.name.toLowerCase().includes('piano');
    }
  },

  async created() {
    this.courseDB = new CourseDB(this._id);
    this.user = await User.instance();

    const userCourses = await this.user.getCourseRegistrationsDoc();
    this.userIsRegistered =
      userCourses.courses.filter((c) => {
        return c.courseID === this._id && (c.status === 'active' || c.status === undefined);
      }).length === 1;
      
    await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.tags = (await getCourseTagStubs(this._id)).rows.map((r) => r.doc!);
    this.updatePending = false;
  },

  methods: {
    async register() {
      log(`Registering for ${this._id}`);
      const res = await this.user!.registerForCourse(this._id);
      if (res.ok) {
        this.userIsRegistered = true;
      }
    },

    async drop() {
      log(`Dropping course ${this._id}`);
      const res = await this.user!.dropCourse(this._id);
      if (res.ok) {
        this.userIsRegistered = false;
      }
    }
  }
});
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.5s ease;
}
.component-fade-enter,
.component-fade-leave-to {
  opacity: 0;
}

.component-scale-enter-active,
.component-scale-leave-active {
  max-height: auto;
  transform: scale(1, 1);
  transform-origin: top;
  transition: transform 0.3s ease, max-height 0.3s ease;
}
.component-scale-enter,
.component-fade-leave-to {
  max-height: 0px;
  transform: scale(1, 0);
  overflow: hidden;
}
</style>

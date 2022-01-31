<template>
  <div v-if="!updatePending">
    <h1 class="display-1"><router-link to="/q">Quilts</router-link> / {{ _courseConfig.name }}</h1>

    <p class="body-2">
      {{ _courseConfig.description }}
    </p>

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
        <router-link :to="`/courses/${_id}/elo`">
          <v-btn dark color="green darken-2" title="Rank course content for difficulty">
            <v-icon left>style</v-icon>
            Arrange
          </v-btn>
        </router-link>
        <v-btn color="error" small outline @click="drop">Drop this course</v-btn>
      </div>
      <div v-else>
        <v-btn color="primary" @click="register">Register</v-btn>
        <router-link :to="`/q/${_id}/preview`">
          <v-btn outline color="primary">Start a trial study session</v-btn>
        </router-link>
      </div>
    </transition>
    <midi-config v-if="isPianoCourse" :_id="_id" />

    <v-card class="my-2">
      <v-toolbar dense>
        <v-toolbar-title>Tags</v-toolbar-title>
        <v-spacer></v-spacer>
        {{ tags.length }}
      </v-toolbar>
      <v-card-text>
        <v-chip outline v-for="(tag, i) in tags" v-bind:key="i">
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
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';
import { log } from 'util';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { getCourseDB } from '../../db';
import { CourseDB, getCourseConfig, getCourseTagStubs } from '../../db/courseDB';
import { Tag } from '../../db/types';
import { CourseConfig } from '../../server/types';
import SkldrVue from '../../SkldrVue';
import CourseCardBrowser from './CourseCardBrowser.vue';

@Component({
  components: { MidiConfig, CourseCardBrowser },
})
export default class CourseInformation extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private courseDB: CourseDB;

  private get isPianoCourse(): boolean {
    return this._courseConfig.name.toLowerCase().includes('piano');
  }

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

  private _courseConfig: CourseConfig;
  public userIsRegistered: boolean = false;
  private tags: Tag[] = [];

  private async created() {
    this.courseDB = new CourseDB(this._id);

    const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    this.userIsRegistered =
      userCourses.courses.filter((c) => {
        return c.courseID === this._id && (c.status === 'active' || c.status === undefined);
      }).length === 1;
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.tags = (await getCourseTagStubs(this._id)).rows.map((r) => r.doc!);
    this.updatePending = false;
  }

  private async register() {
    log(`Registering for ${this._id}`);
    const res = await this.$store.state._user!.registerForCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = true;
    }
  }
  private async drop() {
    log(`Dropping course ${this._id}`);
    const res = await this.$store.state._user!.dropCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = false;
    }
  }
}
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

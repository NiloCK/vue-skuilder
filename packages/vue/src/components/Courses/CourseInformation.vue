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
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';
import { log } from 'util';
import { getCourseDB } from '@/db';
import { CourseDB, getCourseConfig, getCourseTagStubs } from '@/db/courseDB';
import type { Tag } from '@/db/types';
import type { CourseConfig } from '@/server/types';
import CourseCardBrowser from './CourseCardBrowser.vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import { defineComponent, ref, computed, onCreated } from '@vue/composition-api';

export default defineComponent({
  name: 'CourseInformation',
  
  components: { 
    MidiConfig, 
    CourseCardBrowser 
  },

  mixins: [SkldrVueMixin],

  props: {
    _id: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const courseDB = ref<CourseDB | null>(null);
    const _courseConfig = ref<CourseConfig | null>(null);
    const userIsRegistered = ref(false);
    const tags = ref<Tag[]>([]);
    const updatePending = ref(true);

    const nameRules = [
      (value: string) => {
        const max = 30;
        return value.length <= max || `Course name must be ${max} characters or less`;
      }
    ];

    const isPianoCourse = computed(() => 
      _courseConfig.value?.name.toLowerCase().includes('piano') || false
    );

    onCreated(async () => {
      courseDB.value = new CourseDB(props._id);

      const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
      userIsRegistered.value = userCourses.courses.filter(c => 
        c.courseID === props._id && (c.status === 'active' || c.status === undefined)
      ).length === 1;

      await getCourseDB(props._id);
      _courseConfig.value = (await getCourseConfig(props._id))!;
      tags.value = (await getCourseTagStubs(props._id)).rows.map(r => r.doc!);
      updatePending.value = false;
    });

    const register = async () => {
      log(`Registering for ${props._id}`);
      const res = await this.$store.state._user!.registerForCourse(props._id);
      if (res.ok) {
        userIsRegistered.value = true;
      }
    };

    const drop = async () => {
      log(`Dropping course ${props._id}`);
      const res = await this.$store.state._user!.dropCourse(props._id);
      if (res.ok) {
        userIsRegistered.value = false;
      }
    };

    return {
      courseDB,
      _courseConfig,
      userIsRegistered,
      tags,
      updatePending,
      nameRules,
      isPianoCourse,
      register,
      drop
    };
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

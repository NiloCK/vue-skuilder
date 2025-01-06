<template>
  <div v-if="initComplete">
    <course-information v-if="courseId !== undefined && courseId !== ''" v-bind:_id="courseId" />
    <v-container v-else-if="candidates.length === 0">
      <v-layout class="display-1" row wrap>
        {{ query }}
      </v-layout>
      <v-divider></v-divider>
      <v-layout row wrap ma-3 class="headline">Nothing here! </v-layout>

      <v-layout row wrap ma-3>
        <v-dialog v-model="newCourseDialog" fullscreen transition="dialog-bottom-transition" :overlay="false">
          <v-btn color="primary" dark slot="activator">Start a new Quilt</v-btn>
          <course-editor v-bind:name="query" v-on:CourseEditingComplete="newCourseDialog = false" />
        </v-dialog>
      </v-layout>
    </v-container>
    <v-container v-else grid-list-md>
      <div>
        <span class="display-2">{{ query }} </span> <span class="headline">could refer to:</span>
        <v-divider></v-divider>

        <div class="ma-5" v-bind:key="i" v-for="(c, i) in candidates">
          <v-layout class="headline">
            <a
              v-on:click="
                query = c.courseID;
                loadQuery();
              "
              >{{ c.name }}
            </a>
            -
            <v-text-field
              label="Disambiguator"
              vibind:id="`${i}-disambiguator`"
              v-model="c.disambiguator"
              v-on:change="update(c)"
            ></v-text-field>
            {{ c.description }}
          </v-layout>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { disambiguateCourse, getCachedCourseList } from '@/db/courseDB';
import { CourseConfig } from '@/server/types';
import CourseEditor from './CourseEditor.vue';
import CourseInformation from './CourseInformation.vue';

export default defineComponent({
  name: 'CourseRouter',
  
  components: {
    CourseInformation,
    CourseEditor,
  },

  props: {
    query: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      courseList: [] as CourseConfig[],
      courseId: undefined as string | undefined,
      candidates: [] as CourseConfig[],
      newCourseDialog: false,
      initComplete: false
    }
  },

  methods: {
    update(c: CourseConfig) {
      if (c.courseID && c.disambiguator) {
        disambiguateCourse(c.courseID, c.disambiguator);
      } else {
        // todo: indicate error on input box
      }
    },

    loadQuery() {
      const query = this.query.toLowerCase();

      this.candidates = this.courseList.filter((c) => {
        const snakedName = c.name.replace(' ', '_').toLowerCase();
        return (
          query === snakedName || 
          query === c.courseID || 
          query === `${snakedName}_(${c.disambiguator})`
        );
      });

      if (this.candidates.length === 1) {
        this.courseId = this.candidates[0].courseID!;
      } else if (this.candidates.length === 0) {
        this.courseId = '';
      }

      this.initComplete = true;
    }
  },

  async created() {
    this.courseList = await getCachedCourseList();
    this.loadQuery();
  }
});
</script>

<style></style>

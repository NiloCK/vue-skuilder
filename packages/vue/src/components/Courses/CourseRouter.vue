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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { disambiguateCourse, getCachedCourseList } from '@/db/courseDB';
import { CourseConfig } from '@/server/types';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import CourseEditor from './CourseEditor.vue';
import CourseInformation from './CourseInformation.vue';

export default defineComponent({
  name: 'CourseRouter',
  components: {
    CourseInformation,
    CourseEditor,
  },
  mixins: [SkldrVueMixin],
  props: {
    query: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const courseList = ref<CourseConfig[]>([]);
    const courseId = ref<string>('');
    const candidates = ref<CourseConfig[]>([]);
    const newCourseDialog = ref(false);
    const initComplete = ref(false);

    const update = (c: CourseConfig) => {
      if (c.courseID && c.disambiguator) {
        disambiguateCourse(c.courseID, c.disambiguator);
      }
    };

    const loadQuery = () => {
      const query = props.query.toLowerCase();
      
      candidates.value = courseList.value.filter((c) => {
        const snakedName = c.name.replace(' ', '_').toLowerCase();
        return (
          query === snakedName || 
          query === c.courseID || 
          query === `${snakedName}_(${c.disambiguator})`
        );
      });

      if (candidates.value.length === 1) {
        courseId.value = candidates.value[0].courseID!;
      } else if (candidates.value.length === 0) {
        courseId.value = '';
      }

      initComplete.value = true;
    };

    onMounted(async () => {
      courseList.value = await getCachedCourseList();
      loadQuery();
    });

    return {
      courseId,
      candidates,
      newCourseDialog,
      initComplete,
      update,
      loadQuery
    };
  }
});
</script>

<style></style>

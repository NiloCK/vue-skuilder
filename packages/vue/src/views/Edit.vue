<template>
  <div>
    <h1 class="headline">Editing Course Data</h1>

    <v-select
      item-text="name"
      item-value="_id"
      :items="courseList"
      v-model="selectedCourse"
      label="Select a course to contribute to:"
    />

    <course-editor v-if="selectedCourse" v-bind:course="selectedCourse" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import { CourseConfig } from '../server/types';
import { User } from '../db/userDB';

export default defineComponent({
  name: 'Edit',

  components: {
    CourseEditor,
  },

  props: {
    selectedCourse: {
      type: String as PropType<string>,
      default: '',
    },
  },

  data() {
    return {
      courseList: [] as CourseConfig[],
    };
  },

  computed: {
    courseNames(): string[] {
      return this.courseList.map((course) => {
        return course.name;
      });
    },
  },

  async created() {
    const user = await User.instance();
    const courseList = await user.getUserEditableCourses();

    this.courseList = courseList.rows.map((row) => {
      return row.doc!;
    });
  },
});
</script>

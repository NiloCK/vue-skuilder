<template>
  <div>
      <h1 class="headline">Editing Course Data</h1>
      
      <v-select
        :items="courseList"
        v-model="selectedCourse"
        label="Select a course to contribute to:"
      />
      
      <CourseEditor v-if="selectedCourse" v-bind:course="selectedCourse" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import ComponentRegistration from '../components/Edit/ComponentRegistration/ComponentRegistration.vue';
import { Component } from 'vue-property-decorator';
import Courses from '../courses';

@Component({
  components: {
    CourseEditor,
    ComponentRegistration
  }
})
export default class Edit extends Vue {
  public courseList: string[] = [];
  public selectedCourse: string = '';

  private created() {
    this.courseList = Courses.courses.map((course) => {
      return course.name;
    });
  }
}
</script>

<template>
  <div>
      <h1>Editing Course Data</h1>
      Select a course to contribute to:
      <select v-model="selectedCourse">
        <option v-for="course in courseList" :key="course.id" :value="course">
          {{course}}
        </option>
      </select>
      <CourseEditor v-if="selectedCourse" v-bind:course="selectedCourse" />

      <!-- <ComponentRegistration /> -->
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

<template>
  <div>
      <h1>Editing Course Data</h1>
      Select a course to contribute to:
      <select v-model="selectedCourse">
        <option v-for="course in courseList" :key="course.id" :value="course">
          {{course}}
        </option>
      </select>
      <CourseEditor v-bind:course="selectedCourse" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import { Component } from 'vue-property-decorator';
import { getCourseList } from '../db/index';
import Courses from '../courses';

@Component({
  // data() {
  //   return {
  //     // viewables: []
  //   };
  // }
  components: {
    CourseEditor
  }
})
export default class Edit extends Vue {
  public courseList: string[] = [];
  public selectedCourse: string = '';

  private created() {
    this.courseList = Object.getOwnPropertyNames(Courses);
    // Courses.math.forEach( (type) => {
    //   this.courseList.push( type.dataShape.name );
    // });
    // getCourseList().then((courseList) => {
    //   this.courseList = courseList.courses;
    // });
  }
}
</script>

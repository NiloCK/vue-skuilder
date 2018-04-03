<template>
  <div v-if="course">
      <div>
          You are editing: {{ course }}
      </div>
      <div>
          There are {{ dataShapes.length }} data shapes in the course.
      </div>
      <select v-model="selectedShape">
        <option v-for="shape in dataShapes" :key="shape.name" :value="shape.name">
          {{shape}}
        </option>
      </select>
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Course';
import Courses from '@/courses';

@Component({})
export default class CourseEditor extends Vue {
  @Prop() public course: string;
  public dataShapes: DataShape[] = [];
  public selectedShape: string = '';

  public created() {

    this.dataShapes = [
      Courses.math[0].dataShape,
      Courses.math[1].dataShape
    ];
  }
}
</script>

<template>
  <div v-if="course">
      <div>
          You are editing: {{ course }}. {{ testInt }}
      </div>
      <div>
          There are {{ dataShapes.length }} data shapes in the course.
      </div>
      Which data type are you adding?
      <select v-model="selectedShape">
        <option v-for="shape in dataShapes" :key="shape.name" :value="shape">
          {{shape.name}}
        </option>
      </select>
      
      <DataInputForm v-if="selectedShape.name" v-bind:dataShape="selectedShape" />
      
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses from '@/courses';
import { getDataShapes } from '@/db';
import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';

@Component({
  components: {
    DataInputForm
  }
})
export default class CourseEditor extends Vue {
  @Prop() public course: string = '';
  public dataShapes: DataShape[];
  public selectedShape: DataShape = {name: '', fields: []};
  public testInt: number = 30;

  public created() {
    // Works, but not on 'created' - function is returning a doc
    // but component populates with testInt = 0.
    // When the program is recompiled w/ the component 'in view',
    // testInt updates to the number expected (by manually looking
    // in the database)
    getDataShapes(this.course).then( (resp) => {
      this.testInt = resp.docs.length;
    });

    this.dataShapes = [
      Courses.math[0].dataShape,
      Courses.math[1].dataShape
    ];
  }
}
</script>

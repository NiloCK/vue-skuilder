<template>
  <div class="courseEditor" v-if="course">
      <div>
          There are {{ dataShapes.length }} data shapes in the course.
      </div>
      Which data type are you adding?
      <select v-model="selectedShape">
        <option v-for="shape in dataShapes" :key="shape.name" :value="shape">
          {{shape.name}}
        </option>
      </select>
      
      <DataInputForm
        v-if="selectedShape.name"
        v-bind:dataShape="selectedShape"
        v-bind:course="course"
      />
      
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
  @Prop() public course: string;
  public dataShapes: DataShape[] = [];
  public selectedShape: DataShape = {name: '', fields: []};

  public created() {
    Courses[this.course].viewableTypes.forEach( (type) => {
      this.dataShapes.push(type.dataShape);
    });
  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

<template>
  <div class="courseEditor" v-if="course">
      <div>
          There are {{ registeredDataShapes.length }} registered data shapes in the course.
      </div>
      Which data type are you adding?
      <select v-model="selectedShape">
        <option v-for="shape in registeredDataShapes" :key="shape.name" :value="shape">
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
import { getDataShape } from '@/courses';
import { getDataShapes, getDoc } from '@/db';
import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';
import { DataShapeData } from '@/db/types';
import _ from 'lodash';

@Component({
  components: {
    DataInputForm
  }
})
export default class CourseEditor extends Vue {
  @Prop() public course: string;
  public registeredDataShapes: DataShape[] = [];
  public dataShapes: DataShape[] = [];
  public selectedShape: DataShape = {name: '', fields: [], views: []};

  public created() {
    Courses[this.course].viewableTypes.forEach( (type) => {
      this.dataShapes.push(type.dataShape);
    });

    getDataShapes(this.course).then( (results) => {
      results.docs.forEach( (doc) => {
        getDoc<DataShapeData>(doc._id).then( (dataShapeDoc) => {
          const shape = getDataShape(Courses, dataShapeDoc._id);
          if (shape) {
            this.registeredDataShapes.push(shape.dataShape);
          }
          // alert(_.difference(this.dataShapes, this.registeredDataShapes));
        });
      });
    });

  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

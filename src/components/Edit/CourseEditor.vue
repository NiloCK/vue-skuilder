<template>
  <div class="courseEditor" v-if="course">
    <div v-if='loading'>
      <Spinner /> Loading course information from database...
    </div>
    <div v-else>
      <button @click='toggleComponent'>Toggle Content Editing / Component Registration</button>
      <div v-if='editingMode'>

        <div>
          {{`There ${registeredDataShapes.length !== 1 ? 'are' : 'is'} ${registeredDataShapes.length} registered data shape${registeredDataShapes.length === 1 ? '' : 's'} in the course.`}}
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
          v-bind:course="course" />
      </div>
      <ComponentRegistration v-else />

    </div>
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Spinner from 'vue-simple-spinner';
import { DataShape } from '@/base-course/Interfaces/DataShape';
// import Spinner from '@/components/Misc/Spinner.vue';
import Courses from '@/courses';
import { getDataShape } from '@/courses';
import { getDataShapes, getDoc } from '@/db';
import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';
import { DataShapeData } from '@/db/types';
import ComponentRegistration from '@/components/Edit/ComponentRegistration/ComponentRegistration.vue';
import _ from 'lodash';

@Component({
  components: {
    DataInputForm,
    Spinner,
    ComponentRegistration
  }
})
export default class CourseEditor extends Vue {
  @Prop() public course: string;
  public registeredDataShapes: DataShape[] = [];
  public dataShapes: DataShape[] = [];
  public selectedShape: DataShape = { name: '', fields: [], views: [] };
  private loading: boolean = true;
  private editingMode: boolean = true;

  public created() {
    Courses[this.course].viewableTypes.forEach((type) => {
      this.dataShapes.push(type.dataShapes[0]);
    });

    getDataShapes(this.course).then((results) => {
      results.docs.forEach((doc) => {
        getDoc<DataShapeData>(doc._id).then((dataShapeDoc) => {
          const shape = getDataShape(Courses, dataShapeDoc._id);
          if (shape) {
            this.registeredDataShapes.push(shape.dataShapes[0]);
          }
          // alert(_.difference(this.dataShapes, this.registeredDataShapes));
        });
      });
    }).then(() => {
      this.loading = false;
    });
  }

  private toggleComponent() {
    this.editingMode = !this.editingMode;
  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>

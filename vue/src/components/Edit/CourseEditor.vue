<template>
  <div class="courseEditor" v-if="course">
    <div v-if='loading'>
      <v-progress-circular indeterminate color="secondary"></v-progress-circular>
    </div>
    <div v-else>
      <v-btn @click='toggleComponent' color="success">Content Editing / Component Registration</v-btn>
      <div v-if='editingMode'>

        <div>
          {{`There ${registeredDataShapes.length !== 1 ? 'are' : 'is'} ${registeredDataShapes.length} registered data shape${registeredDataShapes.length === 1 ? '' : 's'} in the course.`}}
        </div>
        <v-select
          v-model="selectedShape"
          label="Which data type are you adding?"
          :items="registeredDataShapes.map( (shape) => shape.name )"
        />

        <data-input-form
          v-if="selectedShape !== ''"
          v-bind:dataShape="getDataShape(selectedShape)"
          v-bind:course="course" />
      </div>
      <component-registration v-else :course="course" />

    </div>
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses, { NameSpacer } from '@/courses';
import { getDataShapes, getDoc } from '@/db';
import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';
import { DataShapeData } from '@/db/types';
import ComponentRegistration from '@/components/Edit/ComponentRegistration/ComponentRegistration.vue';
import _ from 'lodash';
import { DataShapeName } from '@/enums/DataShapeNames';
import BasicCard from '@/base-course/CardTypes/BasicCard';
import { FieldType } from '@/enums/FieldType';
import BaseCards from '@/base-course/CardTypes';

@Component({
  components: {
    DataInputForm,
    ComponentRegistration
  }
})
export default class CourseEditor extends Vue {
  @Prop() public course: string;
  public registeredDataShapes: DataShape[] = [];
  public dataShapes: DataShape[] = [];
  public selectedShape: string = '';
  private loading: boolean = true; // datashapes are loading on init
  private editingMode: boolean = true;

  public created() {
    // this.dataShapes = BaseCards.dataShapes;
    // this.registeredDataShapes = BaseCards.dataShapes;
    BaseCards.dataShapes.forEach((shape) => {
      this.dataShapes.push(shape);
      this.registeredDataShapes.push(shape);
    });

    Courses.getCourse(this.course)!.questions.forEach((question) => {
      question.dataShapes.forEach((dataShape) => {
        this.dataShapes.push(dataShape);
      });
    });

    getDataShapes(this.course).then((results) => {
      results.docs.forEach((doc) => {
        getDoc<DataShapeData>(doc._id).then((dataShapeDoc) => {

          this.registeredDataShapes.push(
            this.dataShapes.find((shape) => {
              return shape.name === NameSpacer.getDataShapeDescriptor(dataShapeDoc._id).dataShape;
            })!
          );

          // alert(_.difference(this.dataShapes, this.registeredDataShapes));
        });
      });
    }).then(() => {
      this.loading = false;
    });
  }

  public getDataShape(shapeName: string): DataShape {
    return this.dataShapes.find((shape) => {
      return shape.name === shapeName;
    })!;
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

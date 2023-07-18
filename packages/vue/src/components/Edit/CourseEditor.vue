<template>
  <div class="courseEditor" v-if="course">
    <div v-if="loading">
      <v-progress-circular indeterminate color="secondary"></v-progress-circular>
    </div>
    <div v-else>
      <v-btn v-on:click="toggleComponent" color="success">Content Editing / Component Registration</v-btn>
      <div v-if="editingMode">
        <v-select
          v-model="selectedShape"
          label="What kind of content are you adding?"
          v-bind:items="registeredDataShapes.map((shape) => shape.name)"
        />

        <data-input-form
          v-if="!loading && selectedShape !== '' && courseConfig && dataShape"
          v-bind:data-shape="dataShape"
          v-bind:course-cfg="courseConfig"
        />
      </div>
      <component-registration v-else :course="course" />
    </div>
  </div>
</template>

<script lang="ts">
import { DataShape } from '@/base-course/Interfaces/DataShape';
import ComponentRegistration from '@/components/Edit/ComponentRegistration/ComponentRegistration.vue';
import Courses from '@/courses';
import { NameSpacer } from '@/courses/NameSpacer';
import { BlanksCard, BlanksCardDataShapes } from '@/courses/default/questions/fillIn';
import SkldrVue from '@/SkldrVue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { CourseConfig } from '../../server/types';
import DataInputForm from './ViewableDataInputForm/DataInputForm.vue';
import { getCredentialledCourseConfig } from '@/db/courseAPI';

@Component({
  components: {
    DataInputForm,
    ComponentRegistration,
  },
})
export default class CourseEditor extends SkldrVue {
  @Prop({
    required: true,
    type: String,
  })
  public course: string;
  public registeredDataShapes: DataShape[] = [];
  public dataShapes: DataShape[] = [];

  public selectedShape: string = BlanksCard.dataShapes[0].name; // default to 'BlanksCard'
  public courseConfig: CourseConfig;
  public dataShape: DataShape = BlanksCardDataShapes[0];

  private loading: boolean = true; // datashapes are loading on init
  private editingMode: boolean = true;

  @Watch('selectedShape')
  public onShapeSelected(value?: string, old?: string) {
    if (value) {
      this.dataShape = this.getDataShape(value);
      this.$store.state.dataInputForm.dataShape = this.getDataShape(value);
      this.$store.state.dataInputForm.course = this.courseConfig;
    }
  }
  public async created() {
    this.courseConfig = await getCredentialledCourseConfig(this.course);

    // for testing getCourseTagStubs...
    // log(JSON.stringify(await getCourseTagStubs(this.course)));

    // this.dataShapes = BaseCards.dataShapes;
    // this.registeredDataShapes = BaseCards.dataShapes;
    // BaseCards.dataShapes.forEach((shape) => {
    //   this.dataShapes.push(shape);
    //   this.registeredDataShapes.push(shape);
    // });

    // #55 make all 'programmed' datashapes available, rather than
    // the previous code-based name scoping
    Courses.courses.forEach((course) => {
      course.questions.forEach((question) => {
        question.dataShapes.forEach((ds) => {
          this.dataShapes.push(ds);
        });
      });
    });

    this.courseConfig.dataShapes.forEach((ds) => {
      this.registeredDataShapes.push(
        this.dataShapes.find((shape) => {
          return shape.name === NameSpacer.getDataShapeDescriptor(ds.name).dataShape;
        })!
      );
    });

    this.loading = false;
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

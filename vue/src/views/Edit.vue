<template>
  <div>
      <h1 class="headline">Editing Course Data</h1>
      
      <v-select
        item-text="name"
        item-value="_id"
        :items="courseList"
        v-model="selectedCourse"
        label="Select a course to contribute to:"
      />
      
      <course-editor v-if="selectedCourse" v-bind:course="selectedCourse" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import { Component, Prop } from 'vue-property-decorator';
import { CourseConfig } from '../server/types';
import SkldrVue from '../SkldrVue';

@Component({
  components: {
    CourseEditor
  }
})
export default class Edit extends SkldrVue {
  public courseList: CourseConfig[] = [];
  @Prop()
  public selectedCourse: string = '';

  private get courseNames() {
    return this.courseList.map((course) => {
      return course.name;
    });
  }

  private async created() {
    const courseList = await this.$store.state._user!.getUserEditableCourses();

    this.courseList = courseList.rows.map((row) => {
      return row.doc!;
    });
  }
}
</script>

<template>
  <div>
    <div class="display-1">Select your quilts</div>
    <table width="100%">
      <th><v-checkbox label="Select All" @click.capture="toggleAll" v-model="allSelected"></v-checkbox></th>
      
      <th>Reviews
         <!-- <v-icon>info</v-icon> -->
      </th>

      <tr v-for="course in activeCourses" :key="course.courseID">
        <td><v-checkbox :label="course.name" @click.capture="update" v-model="course.selected"></v-checkbox></td>
        <td>{{course.reviews}}</td>
      </tr>
    </table>
    <!-- Repeat below for classrooms -->
    <v-btn color="success" @click="startSession">Start Studying!</v-btn>
  </div>
</template>

<script lang="ts">
import { CourseRegistration, CourseRegistrationDoc, User } from '@/db/userDB';
import { CourseDB, getCourseName } from '@/db/courseDB';
import SkldrVue from '@/SkldrVue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { StudySessionSource } from '@/views/Study.vue';

@Component({})
export default class SessionConfiguration extends SkldrVue {
  public allSelected: boolean = false;
  public activeCourses: (CourseRegistration & { selected: boolean, name: string, reviews: number })[] = [];
  @Prop({
    required: true
  })
  public startFcn: (sources: StudySessionSource[]) => void;

  private update() {
    console.log(JSON.stringify(this.activeCourses));
  }

  private toggleAll(): void {
    console.log(`Toggling all courses`);

    this.activeCourses.forEach(c => {
      c.selected = this.allSelected;
    });

    console.log(JSON.stringify(this.activeCourses));
  }

  private startSession() {
    this.startFcn(
      this.activeCourses.filter(c => c.selected).map(c => { return { type: 'course', id: c.courseID } })
    );
    // + classroom sources
  }

  public async created() {
    this.activeCourses = (await this.$store.state._user!.getActiveCourses()).map(c => {
      return {
        selected: false,
        name: "",
        ...c,
        reviews: 0
      }
    });
    for (let i = 0; i < this.activeCourses.length; i++) {

      this.activeCourses[i].name = await getCourseName(this.activeCourses[i].courseID);
      this.activeCourses[i].reviews = await
        (await User.instance()).getScheduledReviewCount(this.activeCourses[i].courseID);
    };
  }
};
</script>

<style scoped>
td {
  text-align: center;
  align-content: center;
}

.cb {
  align-content: center !important;
  text-align: center !important;
}
</style>
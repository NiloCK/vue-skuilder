<template>
  <div>
    <v-card v-if="!updatePending">
    
      <v-card-title primary-title>
        <div>
          <h3 class="headline mb-0">{{_courseConfig.name}}</h3>
        </div>
      </v-card-title>
      <v-card-text>
        Questions: {{ questionCount }}

        <p>{{_courseConfig.description}}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="routeToCourse" color="primary">More Info</v-btn>
        <v-btn :loading="addingCourse" @click="registerForCourse" color="primary">Register</v-btn>
      </v-card-actions>
    </v-card>  
  </div>
</template>

<script lang="ts">
import SkldrVue from "../../SkldrVue";
import Component from "vue-class-component";
import {
  CourseConfig,
  CreateCourse,
  ServerRequestType,
  DataShape55,
  QuestionType55,
  ClassroomConfig,
  CreateClassroom
} from "../../server/types";
import serverRequest from "../../server";
import { log } from "util";
import { Prop, Watch } from 'vue-property-decorator';
import { getCourseList, getCourseTagStubs, getCourseConfig } from '../../db/courseDB';
import { getQuestions, getCourseDB } from '../../db';
import { DocType } from '../../db/types';
import { registerUserForCourse } from '../../db/userDB';

@Component({})
export default class CourseStubCard extends SkldrVue {
  @Prop({ required: true }) private _id: string;

  public _courseConfig: CourseConfig;
  public questionCount: number;

  private updatePending: boolean = true;
  private addingCourse: boolean = false;

  private async created() {
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.questionCount = (await db.find({
      selector: {
        docType: DocType.CARD
      }
    })).docs.length;
    this.updatePending = false;
  }

  routeToCourse() {
    this.$router.push(`/quilts/${this._id}`);
  }


  async registerForCourse() {
    this.addingCourse = true;
    log(`Attempting to register for ${this._id}.`);
    await registerUserForCourse(this.$store.state.user, this._id);
    // this.$set(this.spinnerMap, course, undefined);
    // this.refreshData();
    this.$emit('refresh');

  }
}
</script>

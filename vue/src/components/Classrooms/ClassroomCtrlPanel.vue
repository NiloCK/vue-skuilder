<template>
  <div v-if='!updatePending'>
    
    <v-container grid-list-md>
        <h1>{{_classroomCfg.name}}</h1>
        <v-layout wrap column>
          <v-flex xs12 sm6 md4>
            <v-text-field
              v-model="name"
              counter="30"
              :rules="nameRules"
              label="Class Name"
              required
              hint="Eg: Smith, Chemistry, Period 3"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-checkbox label="Allow peer instruction" v-model="peerAssist" :value="true"></v-checkbox>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-select
              :items="birthYears"
              label="Approximate Birth Year of Students"
              v-model="birthYear"
            ></v-select>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-btn :loading="updatePending" color="primary" @click="submit">Create This Class</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    
  </div>  
</template>

<script lang="ts">
import Vue from "vue";
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
import { alertUser } from "../SnackbarService.vue";
import { Status } from "../../enums/Status";
import Mousetrap from "mousetrap";
import { log } from "util";
import moment from "moment";
import { registerUserForClassroom } from '../../db/userDB';
import { getClassroomDB, CLASSROOM_CONFIG } from '../../db/classroomDB';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class ClassroomCtrlPanel extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private mousetrap: MousetrapInstance = new Mousetrap(this.$el);

  private _classTeacherDB: PouchDB.Database;
  private _classroomCfg: ClassroomConfig;

  private nameRules: Array<(value: string) => string | boolean> = [
    value => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    }
  ];

  private updatePending: boolean = true;

  private async created() {
    log(`Route loaded w/ (prop) _id: ${this._id}`);
    this._classTeacherDB = await getClassroomDB(this._id, 'teacher');
    this._classroomCfg = await this._classTeacherDB.get<ClassroomConfig>(CLASSROOM_CONFIG);
    log(`Config: 
    ${JSON.stringify(this._classroomCfg)}`);
    this.updatePending = false;
  }

  private async submit() {
    this.updatePending = true;


  }
}
</script>

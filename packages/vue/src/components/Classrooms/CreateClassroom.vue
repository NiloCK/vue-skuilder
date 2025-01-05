<template>
  <v-card>
    <v-toolbar card dark flat color="primary">
      <v-card-title class="title font-weight-regular" primary-title>Start a New Class</v-card-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="clearFormAndDismiss">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-form>
      <v-container grid-list-md>
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
            <v-select :items="birthYears" label="Approximate Birth Year of Students" v-model="birthYear"></v-select>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-btn :loading="updatePending" color="primary" @click="submit">Create This Class</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import moment from 'moment';
import Mousetrap from 'mousetrap';
import { log } from 'util';
import Component from 'vue-class-component';
import Vue from 'vue';
import { registerUserForClassroom } from '../../db/userDB';
import { Status } from '../../enums/Status';
import serverRequest from '../../server';
import { ClassroomConfig, CreateClassroom, ServerRequestType } from '../../server/types';
import { alertUser } from '../SnackbarService.vue';

@Component({})
export default class ClassroomEditor extends Vue {
  private mousetrap = new Mousetrap(this.$el);

  private peerAssist: boolean = true;
  private name: string = '';
  private birthYear: number | undefined = undefined;

  private id: string = '';
  private nameRules: Array<(value: string) => string | boolean> = [
    (value) => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    },
  ];
  private description: string = '';

  private banner?: Blob = undefined;
  private thumb?: Blob = undefined;

  private updatePending: boolean = false;

  private birthYears: Array<{
    text: string;
    value: number;
  }> = [];

  private created() {
    this.mousetrap.bind('esc', this.clearFormAndDismiss);

    const year: number = moment().year();

    this.birthYears.push({
      text: `< ${year - 17} (Adult Students)`,
      value: 0,
    });

    for (let age = 17; age >= 6; age--) {
      this.birthYears.push({
        text: `${year - age} (Grade ${age - 5})`,
        value: year - age,
      });
    }

    this.birthYears.push({
      text: `>${year - 6} (K or younger)`,
      value: year - 5,
    });
  }

  private async submit() {
    this.updatePending = true;

    const config: ClassroomConfig = {
      name: this.name,
      teachers: [this.$store.state._user!.username],
      students: [],
      birthYear: this.birthYear,
      classMeetingSchedule: '',
      peerAssist: this.peerAssist,
      joinCode: '',
    };

    log(`Class Config:
    ${JSON.stringify(config)}`);

    const result = await serverRequest<CreateClassroom>({
      data: config,
      type: ServerRequestType.CREATE_CLASSROOM,
      response: null,
      user: this.$store.state._user!.username,
    });

    if (result.response) {
      alertUser({
        text: `Class created successfully. Join code: ${result.response.joincode}`,
        status: Status.ok,
      });

      registerUserForClassroom(this.$store.state._user!.username, result.response.uuid, 'teacher');
    }

    this.clearFormAndDismiss();
    this.updatePending = false;
  }

  private clearFormAndDismiss() {
    this.name = '';
    this.description = '';

    this.$emit('ClassroomEditingComplete');
  }
}
</script>

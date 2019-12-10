<template>
  <v-card>
    
  <v-toolbar
  card
  dark
  flat
  color="primary">

    <v-card-title class='title font-weight-regular' primary-title>
      Start a New Quilt
    </v-card-title>
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
                 label="Quilt Name"
                 required
                 hint="Short and descriptive"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>

                <v-textarea
                  v-model="description"
                  outline
                  counter="300"
                  :auto-grow="true"
                  label="Quilt Description"
                  hint="Describe the course. What subject is covered? Who might be interested?">
                </v-textarea>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <label for="">Public or private quilt?</label>
                <v-radio-group
                  required
                  hint="Private quilts can be shared and collaborated on with other individual users, but will not be accessable without an invitation. A private quilt can be made public later."
                  persistent-hint
                  row
                  v-model="publicCourse"
                >
                  <v-radio label="Public" :value="true" ></v-radio>
                  <v-radio label="Private" :value="false"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-btn
                  :loading="updatePending"
                  color="primary"
                  @click="submit"
                >
                  Save Course Changes
                </v-btn>
              </v-flex>            
            </v-layout>
          </v-container>
  </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import SkldrVue from '../../SkldrVue';
import Component from 'vue-class-component';
import { CourseConfig, CreateCourse, ServerRequestType, DataShape55, QuestionType55 } from '../../server/types';
import serverRequest from '../../server';
import { alertUser } from '../SnackbarService.vue';
import { Status } from '../../enums/Status';
import Mousetrap from 'mousetrap';

@Component({})
export default class CourseEditor extends SkldrVue {
  private mousetrap: MousetrapInstance = new Mousetrap(this.$el);

  private id: string = '';
  private name: string = '';
  private nameRules: Array<(value: string) => string | boolean> = [
    (value) => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    }
  ];
  private description: string = '';
  private publicCourse: boolean = false;
  private deleted: boolean = false;
  private admins: string[] = [];
  private moderators: string[] = [];
  private dataShapes: DataShape55[] = [];
  private questionTypes: QuestionType55[] = [];

  private banner?: Blob = undefined;
  private thumb?: Blob = undefined;

  private updatePending: boolean = false;

  private created() {
    this.mousetrap.bind('esc', this.clearFormAndDismiss);
  }

  private async submit() {
    this.updatePending = true;

    const config: CourseConfig = {
      name: this.name,
      description: this.description,
      public: this.publicCourse,
      deleted: this.deleted,
      creator: this.$store.state.user,
      admins: this.admins,
      moderators: this.moderators,
      dataShapes: this.dataShapes,
      questionTypes: this.questionTypes
    };

    const result = await serverRequest<CreateCourse>({
      data: config,
      type: ServerRequestType.CREATE_COURSE,
      response: null,
      user: this.$store.state.user
    });

    if (result.response) {
      alertUser({
        text: `Course ${this.name} created.`,
        status: result.response!.status
      });
    }

    this.clearFormAndDismiss();
    this.updatePending = false;
  }

  private clearFormAndDismiss() {
    this.name = '';
    this.publicCourse = false;
    this.deleted = false;
    this.description = '';
    this.admins = [];
    this.moderators = [];

    this.$emit('CourseEditingComplete');
  }
}
</script>

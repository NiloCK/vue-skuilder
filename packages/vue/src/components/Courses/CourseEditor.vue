<template>
  <v-card>
    <v-toolbar flat color="primary" dark>
      <v-card-title class="text-h6 font-weight-regular"> Start a New Quilt </v-card-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="clearFormAndDismiss">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-form>
      <v-container>
        <v-row cols="12" sm="6" md="4">
          <v-text-field
            v-model="name"
            counter="30"
            :rules="nameRules"
            label="Quilt Name"
            required
            hint="Short and descriptive"
          ></v-text-field>
        </v-row>
        <v-row cols="12" sm="6" md="4">
          <v-textarea
            v-model="description"
            outlined
            counter="300"
            auto-grow
            label="Quilt Description"
            hint="Describe the course. What subject is covered? Who might be interested?"
          >
          </v-textarea>
        </v-row>
        <v-row cols="12" sm="6" md="4">
          <label>Public or private quilt?</label>
          <v-radio-group
            required
            hint="Private quilts can be shared and collaborated on with other individual users, but will not be accessable without an invitation. A private quilt can be made public later."
            persistent-hint
            row
            v-model="publicCourse"
          >
            <v-radio label="Public" :value="true"></v-radio>
            <v-radio label="Private" :value="false"></v-radio>
          </v-radio-group>
        </v-row>
        <v-row cols="12" sm="6" md="4">
          <v-btn :loading="updatePending" color="primary" @click="submit"> Save Course Changes </v-btn>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Mousetrap from 'mousetrap';
import serverRequest from '../../server';
import { CourseConfig, CreateCourse, DataShape55, QuestionType55, ServerRequestType } from '../../server/types';
import { alertUser } from '../SnackbarService.vue';
import { User } from '../../db/userDB';

export default defineComponent({
  name: 'CourseEditor',

  props: {
    name: {
      type: String,
      required: false,
      default: '',
    },
  },

  data() {
    return {
      mousetrap: new Mousetrap(this.$el),
      id: '',
      description: '',
      publicCourse: false,
      deleted: false,
      admins: [] as string[],
      moderators: [] as string[],
      dataShapes: [] as DataShape55[],
      questionTypes: [] as QuestionType55[],
      banner: undefined as Blob | undefined,
      thumb: undefined as Blob | undefined,
      updatePending: false,
      nameRules: [
        (value: string): string | boolean => {
          const max = 30;
          if (value.length > max) {
            return `Course name must be ${max} characters or less`;
          } else {
            return true;
          }
        },
      ],
    };
  },

  created() {
    this.mousetrap.bind('esc', this.clearFormAndDismiss);
  },

  methods: {
    async submit() {
      this.updatePending = true;

      const u = await User.instance();

      const config: CourseConfig = {
        name: this.name,
        description: this.description,
        public: this.publicCourse,
        deleted: this.deleted,
        creator: u.username,
        admins: this.admins,
        moderators: this.moderators,
        dataShapes: this.dataShapes,
        questionTypes: this.questionTypes,
      };

      const result = await serverRequest<CreateCourse>({
        data: config,
        type: ServerRequestType.CREATE_COURSE,
        response: null,
        user: u.username,
      });

      if (result.response && result.response.ok) {
        alertUser({
          text: `Course ${this.name} created.`,
          status: result.response!.status,
        });
        this.clearFormAndDismiss();
      } else {
        alertUser({
          text: `Failed to create course ${this.name}.`,
          status: result.response!.status,
        });
        console.warn(`Resp: ${JSON.stringify(result.response)}`);
      }

      this.updatePending = false;
    },

    clearFormAndDismiss() {
      this.description = '';
      this.publicCourse = false;
      this.deleted = false;
      this.admins = [];
      this.moderators = [];

      this.$emit('CourseEditingComplete');
    },
  },
});
</script>

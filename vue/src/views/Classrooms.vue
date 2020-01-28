<template>
  <div>
    <v-form>
      <label for="joinCode">Class Code</label> 
      <v-text-field
        name="joinCode"
        label=""
        id="joinCode"
        :v-model="joinCode"
      ></v-text-field>
      <v-btn>Join a class </v-btn>
    </v-form>

    <v-dialog
              v-model="newClassDialog"
              fullscreen
              transition="dialog-bottom-transition"
              :overlay="false"
            >
              <v-btn color="primary" dark slot="activator">Start a new Class</v-btn>
                <classroom-editor 
                 v-on:CourseEditingComplete="processResponse($event)"
                />
            </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import serverRequest from '@/server/index';
import { ServerRequestType, JoinClassroom, CreateClassroom } from '@/server/types';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';
import { log } from 'util';
import ClassroomEditor from '@/components/Classrooms/CreateClassroom.vue';

@Component({
  components: {
    ClassroomEditor
  }
})
export default class Classroom extends SkldrVue {
  public classes: string[] = [];
  private joinCode: string = '';

  private newClassDialog: boolean = false;

  public beforeRouteEnter(to: any, from: any, next: () => {}) {
    // todo ?
    // See https://router.vuejs.org/guide/advanced/data-fetching.html#fetching-before-navigation
  }

  private async deleteClass(classId: string) {
    const result = await serverRequest({
      type: ServerRequestType.DELETE_CLASSROOM,
      user: this.$store.state.user,
      classID: classId,
      response: null
    });
  }

  private async joinClass() {
    const result = await serverRequest<JoinClassroom>({
      type: ServerRequestType.JOIN_CLASSROOM,
      classID: this.joinCode,
      user: this.$store.state.user,
      response: null
    });
  }

  private async createClass() {
    const status = await serverRequest<CreateClassroom>({
      type: ServerRequestType.CREATE_CLASSROOM,
      className: 'hi',
      user: this.$store.state.user,
      response: null
    });

    alertUser({
      text: `Class ${JSON.stringify(status)} Created`,
      status: Status.ok
    });
  }
}
</script>

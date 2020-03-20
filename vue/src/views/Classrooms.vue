<template>
  <v-container fluid>
      <v-layout row wrap justify-space-around>

    <v-flex md4 sm12 xs12>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>My Classes</v-toolbar-title>
        </v-toolbar>

        <v-list>
          <transition-group
              name='component-fade'
              mode='out-in'
              key='registered'
          >
          <template v-for="classroom in studentClasses">
            
            <v-list-tile
              :key="classroom._id"
              avatar
            >

              <v-list-tile-content>
                <v-list-tile-title>
                  {{ classroom.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="secondary"
                 @click="leaveClass(classroom._id)"
                 :loading="spinnerMap[classroom._id] !== undefined"
                >
                  Leave this class
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
          </transition-group>
        </v-list>
      </v-card>
      
      
    </v-flex>

    <v-flex v-if="teacherClasses.length > 0" md4 sm12 xs12>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>Classes I Teach</v-toolbar-title>
        </v-toolbar>

        <v-list>
          <transition-group
              name='component-fade'
              mode='out-in'
              key='registered'
          >
          <template v-for="classroom in teacherClasses">
            
            <v-list-tile
              :key="classroom._id"
              avatar
            >

              <v-list-tile-content>
                <v-list-tile-title>
                  {{ classroom.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="secondary"
                 @click="leaveClass(classroom._id)"
                 :loading="spinnerMap[classroom._id] !== undefined"
                >
                  Leave this class
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
          </transition-group>
        </v-list>
      </v-card>
      
      
    </v-flex>

    </v-layout>

    <v-form>
      <label for="joinCode">Class Code</label> 
      <v-text-field
        name="joinCode"
        label=""
        id="joinCode"
        v-model="joinCode"
      ></v-text-field>
      <v-btn @click='joinClass'>Join a class </v-btn>
    </v-form>

    <v-dialog
              v-model="newClassDialog"
              fullscreen
              transition="dialog-bottom-transition"
              :overlay="false"
            >
              <v-btn color="primary" dark slot="activator">Start a new Class</v-btn>
                <classroom-editor 
                 v-on:ClassroomEditingComplete="processResponse($event)"
                />
    </v-dialog>
  </v-container>
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
import { registerUserForClassroom, getUserClassrooms } from '../db/userDB';
import { getClassroomConfig } from '../db/classroomDB';

@Component({
  components: {
    ClassroomEditor
  }
})
export default class Classroom extends SkldrVue {
  public classes: string[] = [];
  private joinCode: string = '';

  private studentClasses: {
    _id: string;
    name: string;
  }[] = [];
  private teacherClasses: {
    _id: string;
    name: string;
  }[] = [];

  private spinnerMap: {
    [index: string]: boolean
  } = {};

  private newClassDialog: boolean = false;

  public async created() {
    this.refreshData();
  }

  public beforeRouteEnter(to: any, from: any, next: () => {}) {
    // todo ?
    // See https://router.vuejs.org/guide/advanced/data-fetching.html#fetching-before-navigation

    // this.refreshData().then(() => {
    //   next();
    // });
  }


  private async refreshData() {
    const registrations = (await getUserClassrooms(this.$store.state.user)).registrations;
    registrations.forEach(async (reg) => {
      const cfg = await getClassroomConfig(reg.classID);
      log(`Registered class: ${cfg}`);
      const regItem = {
        _id: reg.classID,
        name: cfg.name
      };

      if (reg.registeredAs === 'student') {
        this.studentClasses.push(regItem);
      } else if (reg.registeredAs === 'teacher') {
        this.teacherClasses.push(regItem);
      }
    });
  }

  private async deleteClass(classId: string) {
    const result = await serverRequest({
      type: ServerRequestType.DELETE_CLASSROOM,
      user: this.$store.state.user,
      classID: classId,
      response: null
    });
  }

  private async leaveClass(classID: string) {
    this.$set(this.spinnerMap, classID, true);
    log(`Attempting to drop class: ${classID}`);



    this.$set(this.spinnerMap, classID, undefined);
    this.refreshData();
  }

  private async joinClass() {
    const result = await serverRequest<JoinClassroom>({
      type: ServerRequestType.JOIN_CLASSROOM,
      data: {
        joinCode: this.joinCode,
        registerAs: 'student',
        user: this.$store.state.user
      },
      user: this.$store.state.user,
      response: null
    });

    if (result.response && result.response.ok) {
      log(`Adding registration to userDB...`);
      await registerUserForClassroom(this.$store.state.user, result.response!.id_course, 'student');
      alertUser({
        text: `Successfully joined class: ${result.response.course_name}.`,
        status: Status.ok
      })
    } else {
      if (result.response) {
        alertUser({
          text: result.response.errorText!,
          status: Status.error
        });
      }
    }
  }
  private async processResponse() {
    this.newClassDialog = !this.newClassDialog;
  }

}
</script>

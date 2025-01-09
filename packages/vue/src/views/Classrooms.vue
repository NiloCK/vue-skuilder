<template>
  <v-container fluid>
    <v-row class="pa-4" justify="space-around">
      <v-col v-if="studentClasses.length > 0" cols="12" sm="12" md="4">
        <v-card>
          <v-toolbar>
            <v-toolbar-title>My Classes</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in" key="registered">
              <template v-for="classroom in studentClasses">
                <v-list-item :key="classroom._id" avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ classroom.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      small
                      color="secondary"
                      @click="leaveClass(classroom._id)"
                      :loading="spinnerMap[classroom._id] !== undefined"
                    >
                      Leave this class
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </transition-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col v-if="teacherClasses.length > 0" cols="12" sm="12" md="4">
        <v-card>
          <v-toolbar>
            <v-toolbar-title>Classes I Manage</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in" key="registered">
              <template v-for="classroom in teacherClasses">
                <v-list-item :key="classroom._id" avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ classroom.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <router-link :to="`/classrooms/${classroom._id}`">
                      <v-btn small color="secondary" :loading="spinnerMap[classroom._id] !== undefined"> Open </v-btn>
                    </router-link>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </transition-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col v-if="studentClasses.length === 0 && teacherClasses.length === 0" class="headline">
        You are not in any classes! Join your class below if someone has given you a joincode. Or else, start your own!
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <v-row class="pa-4">
      <v-col cols="12" sm="12" md="8" lg="6" xl="6">
        <v-card>
          <!-- <v-form> -->
          <v-toolbar>
            <v-toolbar-title>Join a class</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field name="joinCode" label="Class Code" id="joinCode" v-model="joinCode"></v-text-field>
            <v-btn color="primary" @click="joinClass">Join</v-btn>
          </v-card-text>
          <!-- </v-form> -->
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="newClassDialog" fullscreen transition="dialog-bottom-transition" :overlay="false">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on">Start a new Class</v-btn>
      </template>
      <classroom-editor v-on:ClassroomEditingComplete="processResponse($event)" />
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import serverRequest from '@/server/index';
import { ServerRequestType, JoinClassroom, CreateClassroom, LeaveClassroom } from '@/server/types';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';
import { log } from 'util';
import ClassroomEditor from '@/components/Classrooms/CreateClassroom.vue';
import { registerUserForClassroom, getUserClassrooms, dropUserFromClassroom } from '../db/userDB';
import { getClassroomConfig } from '../db/classroomDB';

interface CourseReg {
  _id: string;
  name: string;
}

export default defineComponent({
  name: 'Classroom',
  
  components: {
    ClassroomEditor,
  },

  data() {
    return {
      classes: [] as string[],
      joinCode: '',
      studentClasses: [] as CourseReg[],
      teacherClasses: [] as CourseReg[],
      spinnerMap: {} as { [index: string]: boolean },
      newClassDialog: false,
    };
  },

  created() {
    this.refreshData();
  },

  beforeRouteEnter(to: any, from: any, next: () => void) {
    // todo ?
    // See https://router.vuejs.org/guide/advanced/data-fetching.html#fetching-before-navigation
    // this.refreshData().then(() => {
    //   next();
    // });
    next();
  },

  methods: {
    async refreshData() {
      const registrations = (await getUserClassrooms(this.$store.state._user!.username)).registrations;
      const studentClasses: CourseReg[] = [];
      const teacherClasses: CourseReg[] = [];

      registrations.forEach(async (reg) => {
        const cfg = await getClassroomConfig(reg.classID);
        log(`Registered class: ${JSON.stringify(cfg)}`);
        const regItem = {
          _id: reg.classID,
          name: cfg.name,
        };

        if (reg.registeredAs === 'student') {
          studentClasses.push(regItem);
        } else if (reg.registeredAs === 'teacher') {
          teacherClasses.push(regItem);
        }
      });

      this.studentClasses = studentClasses;
      this.teacherClasses = teacherClasses;
    },

    async deleteClass(classId: string) {
      const result = await serverRequest({
        type: ServerRequestType.DELETE_CLASSROOM,
        user: this.$store.state._user!.username,
        classID: classId,
        response: null,
      });
    },

    async leaveClass(classID: string) {
      this.$set(this.spinnerMap, classID, true);
      log(`Attempting to drop class: ${classID}`);

      const result = await serverRequest<LeaveClassroom>({
        type: ServerRequestType.LEAVE_CLASSROOM,
        data: {
          classID: classID,
        },
        user: this.$store.state._user!.username,
        response: null,
      });
      if (result.response && result.response.ok) {
        await dropUserFromClassroom(this.$store.state._user!.username, classID);
      }

      this.$set(this.spinnerMap, classID, undefined);
      this.refreshData();
    },

    async joinClass() {
      const result = await serverRequest<JoinClassroom>({
        type: ServerRequestType.JOIN_CLASSROOM,
        data: {
          joinCode: this.joinCode,
          registerAs: 'student',
          user: this.$store.state._user!.username,
        },
        user: this.$store.state._user!.username,
        response: null,
      });

      if (result.response && result.response.ok) {
        log(`Adding registration to userDB...`);
        await registerUserForClassroom(this.$store.state._user!.username, result.response!.id_course, 'student');
        alertUser({
          text: `Successfully joined class: ${result.response.course_name}.`,
          status: Status.ok,
        });
      } else {
        if (result.response) {
          alertUser({
            text: result.response.errorText!,
            status: Status.error,
          });
        }
      }
      this.refreshData();
    },

    async processResponse() {
      this.newClassDialog = !this.newClassDialog;
    },
  },
});
</script>

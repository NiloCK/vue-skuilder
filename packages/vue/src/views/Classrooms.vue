<template>
  <v-container fluid>
    <v-row class="pa-4" justify="space-around">
      <!-- Student Classes -->
      <v-col v-if="studentClasses.length > 0" cols="12" sm="12" md="4">
        <v-card>
          <v-toolbar color="primary">
            <v-toolbar-title>My Classes</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in">
              <v-list-item v-for="classroom in studentClasses" :key="classroom._id" :value="classroom">
                <v-list-item-title>
                  {{ classroom.name }}
                </v-list-item-title>

                <template v-slot:append>
                  <v-btn
                    size="small"
                    color="secondary"
                    @click="leaveClass(classroom._id)"
                    :loading="spinnerMap[classroom._id] !== undefined"
                  >
                    Leave this class
                  </v-btn>
                </template>
              </v-list-item>
            </transition-group>
          </v-list>
        </v-card>
      </v-col>

      <!-- Teacher Classes -->
      <v-col v-if="teacherClasses.length > 0" cols="12" sm="12" md="4">
        <v-card>
          <v-toolbar color="primary">
            <v-toolbar-title>Classes I Manage</v-toolbar-title>
          </v-toolbar>

          <v-list>
            <transition-group name="component-fade" mode="out-in">
              <v-list-item v-for="classroom in teacherClasses" :key="classroom._id" :value="classroom">
                <v-list-item-title>
                  {{ classroom.name }}
                </v-list-item-title>

                <template v-slot:append>
                  <v-btn
                    size="small"
                    color="secondary"
                    :loading="spinnerMap[classroom._id] !== undefined"
                    :to="`/classrooms/${classroom._id}`"
                  >
                    Open
                  </v-btn>
                </template>
              </v-list-item>
            </transition-group>
          </v-list>
        </v-card>
      </v-col>

      <!-- Empty State Message -->
      <v-col v-if="studentClasses.length === 0 && teacherClasses.length === 0" class="text-h5 text-center">
        You are not in any classes! Join your class below if someone has given you a joincode. Or else, start your own!
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Join Class Form -->
    <v-row class="pa-4">
      <v-col cols="12" sm="12" md="8" lg="6" xl="6">
        <v-card>
          <v-toolbar color="primary">
            <v-toolbar-title>Join a class</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field v-model="joinCode" label="Class Code" variant="outlined"></v-text-field>
            <v-btn color="primary" @click="joinClass">Join</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- New Class Dialog -->
    <v-dialog v-model="newClassDialog" fullscreen transition="dialog-bottom-transition" :scrim="false">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props">Start a new Class</v-btn>
      </template>
      <classroom-editor @classroom-editing-complete="processResponse" />
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
import { User } from '../db/userDB';

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
      user: null as User | null,
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
      this.$data.user = await User.instance();
      const registrations = (await getUserClassrooms(this.$data.user.username)).registrations;
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
        user: this.user?.username || '',
        classID: classId,
        response: null,
      });
    },

    async leaveClass(classID: string) {
      this.spinnerMap[classID] = true;
      log(`Attempting to drop class: ${classID}`);

      const result = await serverRequest<LeaveClassroom>({
        type: ServerRequestType.LEAVE_CLASSROOM,
        data: {
          classID: classID,
        },
        user: this.user?.username || '',
        response: null,
      });
      if (result.response && result.response.ok) {
        if (this.user) {
          await dropUserFromClassroom(this.user.username, classID);
        }
      }

      delete this.spinnerMap[classID];
      this.refreshData();
    },

    async joinClass() {
      const result = await serverRequest<JoinClassroom>({
        type: ServerRequestType.JOIN_CLASSROOM,
        data: {
          joinCode: this.joinCode,
          registerAs: 'student',
          user: this.user?.username || '',
        },
        user: this.user?.username || '',
        response: null,
      });

      if (result.response && result.response.ok) {
        log(`Adding registration to userDB...`);
        if (this.user) {
          await registerUserForClassroom(this.user.username, result.response!.id_course, 'student');
          alertUser({
            text: `Successfully joined class: ${result.response.course_name}.`,
            status: Status.ok,
          });
        } else {
          alertUser({
            text: `Failed to join class. [Unknown current user.]`,
            status: Status.error,
          });
        }
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

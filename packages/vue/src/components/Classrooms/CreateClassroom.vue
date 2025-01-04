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
import { defineComponent, ref, onMounted } from 'vue';
import moment from 'moment';
import Mousetrap from 'mousetrap';
import { log } from 'util';
import { registerUserForClassroom } from '../../db/userDB';
import { Status } from '../../enums/Status';
import serverRequest from '../../server';
import { ClassroomConfig, CreateClassroom, ServerRequestType } from '../../server/types';
import { alertUser } from '../SnackbarService.vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'ClassroomEditor',
  
  setup(props, { emit }) {
    const { log } = SkldrComposable();
    const mousetrap = ref<Mousetrap>();
    const peerAssist = ref(true);
    const name = ref('');
    const birthYear = ref<number | undefined>(undefined);
    const updatePending = ref(false);
    const birthYears = ref<Array<{ text: string; value: number }>>([]);

    const nameRules = [
      (value: string) => {
        const max = 30;
        return value.length <= max || `Course name must be ${max} characters or less`;
      },
    ];

    const clearFormAndDismiss = () => {
      name.value = '';
      emit('ClassroomEditingComplete');
    };

    const submit = async () => {
      updatePending.value = true;

      const config: ClassroomConfig = {
        name: name.value,
        teachers: [useStore().state._user!.username],
        students: [],
        birthYear: birthYear.value,
        classMeetingSchedule: '',
        peerAssist: peerAssist.value,
        joinCode: '',
      };

      log(`Class Config: ${JSON.stringify(config)}`);

      const result = await serverRequest<CreateClassroom>({
        data: config,
        type: ServerRequestType.CREATE_CLASSROOM,
        response: null,
        user: useStore().state._user!.username,
      });

      if (result.response) {
        alertUser({
          text: `Class created successfully. Join code: ${result.response.joincode}`,
          status: Status.ok,
        });

        registerUserForClassroom(useStore().state._user!.username, result.response.uuid, 'teacher');
      }

      clearFormAndDismiss();
      updatePending.value = false;
    };

    onMounted(() => {
      mousetrap.value = new Mousetrap(document.body);
      mousetrap.value.bind('esc', clearFormAndDismiss);

      const year: number = moment().year();

      birthYears.value.push({
        text: `< ${year - 17} (Adult Students)`,
        value: 0,
      });

      for (let age = 17; age >= 6; age--) {
        birthYears.value.push({
          text: `${year - age} (Grade ${age - 5})`,
          value: year - age,
        });
      }

      birthYears.value.push({
        text: `>${year - 6} (K or younger)`,
        value: year - 5,
      });
    });

    return {
      peerAssist,
      name,
      birthYear,
      nameRules,
      updatePending,
      birthYears,
      submit,
      clearFormAndDismiss
    };
  }
});
</script>

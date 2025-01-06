<template>
  <v-layout row wrap>
    <!-- <router-link

  > -->
    <v-btn fab color="red" right dark absolute @click="close">
      <v-icon>close</v-icon>
    </v-btn>
    <!-- </router-link> -->
    <v-flex pa-5 fill-height text-sm-center class="display-4 justify-height" v-if="!updatePending">
      {{ _classroomCfg.joinCode }}
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { log } from 'util';
import Vue from 'vue';
import TeacherClassroomDB from '../../db/classroomDB';
import { ClassroomConfig } from '../../server/types';

export default Vue.extend({
  name: 'JoinCode',
  
  props: {
    _id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      _classroomCfg: null as ClassroomConfig | null,
      classroomDB: null as TeacherClassroomDB | null,
      updatePending: true
    }
  },

  async created() {
    this.classroomDB = await TeacherClassroomDB.factory(this._id);
    this._classroomCfg = await this.classroomDB.getConfig();
    await Promise.all([]);
    log(`Route loaded w/ (prop) _id: ${this._id}`);
    log(`Config:
    ${JSON.stringify(this._classroomCfg)}`);
    this.updatePending = false;
  },

  methods: {
    close() {
      this.$router.back();
    }
  }
});
</script>

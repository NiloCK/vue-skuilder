<template>
  <v-container fluid class="fill-height pa-0">
    <!-- Close button in top-right corner -->
    <v-btn fab color="red" dark class="close-btn" @click="close">
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <!-- Main content -->
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" class="text-center">
        <div v-if="!updatePending" class="join-code">
          {{ _classroomCfg.joinCode }}
        </div>
        <v-progress-circular v-else indeterminate size="64"></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>
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
      required: true,
    },
  },

  data() {
    return {
      _classroomCfg: null as ClassroomConfig | null,
      classroomDB: null as TeacherClassroomDB | null,
      updatePending: true,
    };
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
    },
  },
});
</script>

<style>
.close-btn {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 100;
}

.join-code {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: 0.1em;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .join-code {
    font-size: 4rem;
  }
}
</style>

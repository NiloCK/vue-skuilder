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
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Vue from 'vue';
import TeacherClassroomDB from '../../db/classroomDB';
import { ClassroomConfig } from '../../server/types';

@Component({})
export default class JoinCode extends Vue {
  @Prop({ required: true }) private _id: string;

  private _classroomCfg: ClassroomConfig;
  private classroomDB: TeacherClassroomDB;
  private updatePending: boolean = true;

  private async created() {
    this.classroomDB = await TeacherClassroomDB.factory(this._id);
    Promise.all([(this._classroomCfg = await this.classroomDB.getConfig())]);
    log(`Route loaded w/ (prop) _id: ${this._id}`);
    log(`Config:
    ${JSON.stringify(this._classroomCfg)}`);
    this.updatePending = false;
  }
  private close() {
    this.$router.back();
  }
}
</script>

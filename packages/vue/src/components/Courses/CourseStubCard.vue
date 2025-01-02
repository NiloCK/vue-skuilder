<template>
  <v-card v-if="!updatePending">
    <v-app-bar dense flat>
      <v-toolbar-title @click="routeToCourse">
        {{ _courseConfig.name }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-icon v-if="isPrivate">mdi-eye-off</v-icon>
    </v-app-bar>
    <v-card-text>
      Questions: {{ questionCount }}

      <p>{{ _courseConfig.description }}</p>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="routeToCourse" color="primary">More Info</v-btn>
      <v-btn :loading="addingCourse" @click="registerForCourse" color="primary">Register</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { log } from 'util';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { getCourseDB } from '@/db';
import { getCourseConfig } from '@/db/courseDB';
import { DocType } from '@/db/types';
import { CourseConfig } from '@/server/types';

@Component({})
export default class CourseStubCard extends SkldrVue {
  @Prop({ required: true }) private _id: string;

  public _courseConfig: CourseConfig;
  public questionCount: number;
  public isPrivate: boolean = false;

  private updatePending: boolean = true;
  private addingCourse: boolean = false;

  private async created() {
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.isPrivate = !this._courseConfig.public;
    this.questionCount = (
      await db.find({
        limit: 1000,
        selector: {
          docType: DocType.CARD,
        },
      })
    ).docs.length;
    this.updatePending = false;
  }

  routeToCourse() {
    this.$router.push(`/q/${this._courseConfig.name.replace(' ', '_')}`);
  }

  async registerForCourse() {
    this.addingCourse = true;
    log(`Attempting to register for ${this._id}.`);
    await this.$store.state._user!.registerForCourse(this._id);
    // this.$set(this.spinnerMap, course, undefined);
    // this.refreshData();
    this.$emit('refresh');
  }
}
</script>

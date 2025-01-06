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
import { defineComponent } from 'vue';
import { log } from 'util';
import { getCourseDB } from '@/db';
import { getCourseConfig } from '@/db/courseDB';
import { DocType } from '@/db/types';
import { CourseConfig } from '@/server/types';

export default defineComponent({
  name: 'CourseStubCard',
  
  props: {
    _id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      _courseConfig: null as CourseConfig | null,
      questionCount: 0,
      isPrivate: false,
      updatePending: true,
      addingCourse: false
    };
  },

  async created() {
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
  },

  methods: {
    routeToCourse() {
      this.$router.push(`/q/${this._courseConfig!.name.replace(' ', '_')}`);
    },

    async registerForCourse() {
      this.addingCourse = true;
      log(`Attempting to register for ${this._id}.`);
      await this.$store.state._user!.registerForCourse(this._id);
      this.$emit('refresh');
    }
  }
});
</script>

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
import { defineComponent, ref, PropType, onMounted } from 'vue';
import { getCourseDB } from '@/db';
import { getCourseConfig } from '@/db/courseDB';
import { DocType } from '@/db/types';
import type { CourseConfig } from '@/server/types';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { log } from 'util';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import type { AppState } from '@/store';

export default defineComponent({
  name: 'CourseStubCard',
  
  props: {
    _id: {
      type: String as PropType<string>,
      required: true
    }
  },

  emits: ['refresh'],

  setup(props, { emit }) {
    const { log } = SkldrComposable();
    const router = useRouter();
    const store = useStore<AppState>();

    const _courseConfig = ref<CourseConfig | null>(null);
    const questionCount = ref(0);
    const isPrivate = ref(false);
    const updatePending = ref(true);
    const addingCourse = ref(false);

    onMounted(async () => {
      const db = await getCourseDB(props._id);
      _courseConfig.value = await getCourseConfig(props._id);
      isPrivate.value = !_courseConfig.value?.public;
      questionCount.value = (
        await db.find({
          limit: 1000,
          selector: {
            docType: DocType.CARD,
          },
        })
      ).docs.length;
      updatePending.value = false;
    });

    const routeToCourse = () => {
      router.push(`/q/${_courseConfig.value?.name.replace(' ', '_')}`);
    };

    const registerForCourse = async () => {
      addingCourse.value = true;
      log(`Attempting to register for ${props._id}.`);
      await store.state._user?.registerForCourse(props._id);
      emit('refresh');
    };

    return {
      _courseConfig,
      questionCount,
      isPrivate,
      updatePending,
      addingCourse,
      routeToCourse,
      registerForCourse
    };
  }
});
</script>

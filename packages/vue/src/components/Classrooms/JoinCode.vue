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
import { defineComponent, ref, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { log } from 'util';
import TeacherClassroomDB from '../../db/classroomDB';
import { ClassroomConfig } from '../../server/types';
import SkldrVueMixin from '../../mixins/SkldrVueMixin';
import { SkldrComposable } from '../../mixins/SkldrComposable';

export default defineComponent({
  name: 'JoinCode',
  mixins: [SkldrVueMixin],
  
  props: {
    _id: {
      type: String as PropType<string>,
      required: true
    }
  },

  setup(props) {
    const router = useRouter();
    const { log: skldrLog } = SkldrComposable();
    
    const _classroomCfg = ref<ClassroomConfig | null>(null);
    const classroomDB = ref<TeacherClassroomDB | null>(null);
    const updatePending = ref(true);

    const created = async () => {
      classroomDB.value = await TeacherClassroomDB.factory(props._id);
      _classroomCfg.value = await classroomDB.value.getConfig();
      
      log(`Route loaded w/ (prop) _id: ${props._id}`);
      log(`Config: ${JSON.stringify(_classroomCfg.value)}`);
      updatePending.value = false;
    };

    const close = () => {
      router.back();
    };

    created(); // Call created immediately in setup

    return {
      _classroomCfg,
      updatePending,
      close
    };
  }
});
</script>

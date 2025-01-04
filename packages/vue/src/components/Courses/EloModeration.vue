<template>
  <v-row column v-if="!updatePending">
    <v-row cols="1">
      <h1>Which seems <em>harder</em>?</h1>
    </v-row>

    <v-row>
      <v-btn v-on:click="vote('a')" color="success" class="ma-5"><v-icon>check</v-icon></v-btn>
      <card-loader class="ma-2" v-bind:qualified_id="id1" />
    </v-row>

    <v-row>
      <v-btn v-on:click="vote('b')" color="success" class="ma-5"><v-icon>check</v-icon></v-btn>
      <card-loader class="ma-2" v-bind:qualified_id="id2" />
    </v-row>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import CardLoader from '@/components/Study/CardLoader.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import { CourseElo, adjustCourseScores } from '@/tutor/Elo';
import { CourseDB, getCourseConfig, updateCardElo } from '@/db/courseDB';
import type { CourseConfig } from '@/server/types';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default defineComponent({
  name: 'ELOModerator',
  components: {
    CardViewer,
    CardLoader,
  },
  mixins: [SkldrVueMixin],
  props: {
    _id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const updatePending = ref(true);
    const courseDB = ref<CourseDB | null>(null);
    const _courseConfig = ref<CourseConfig | null>(null);
    
    const cards = ref<{
      courseId: string;
      cardId: string;
      elo: CourseElo;
      count: number;
    }[]>([]);
    
    const id1 = ref('');
    const id2 = ref('');
    const elo1 = ref<CourseElo>();
    const elo2 = ref<CourseElo>();

    const getNewCards = async () => {
      updatePending.value = true;
      cards.value = await courseDB.value!.getInexperiencedCards();

      id1.value = '';
      id2.value = '';

      id1.value = `${props._id}-${cards.value[0].cardId}`;
      id2.value = `${props._id}-${cards.value[1].cardId}`;

      elo1.value = cards.value[0].elo;
      elo2.value = cards.value[1].elo;

      updatePending.value = false;
    };

    const vote = (x: 'a' | 'b') => {
      const scores = adjustCourseScores(elo1.value!, elo2.value!, x === 'a' ? 1 : 0, {
        globalOnly: true,
      });

      updateCardElo(props._id, cards.value[0].cardId, scores.userElo);
      updateCardElo(props._id, cards.value[1].cardId, scores.cardElo);

      getNewCards();
    };

    onMounted(async () => {
      courseDB.value = new CourseDB(props._id);
      _courseConfig.value = (await getCourseConfig(props._id))!;
      getNewCards();
    });

    return {
      updatePending,
      cards,
      id1,
      id2,
      elo1,
      elo2,
      vote
    };
  }
});
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.5s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

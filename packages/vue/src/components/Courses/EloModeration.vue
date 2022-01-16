<template>
  <v-layout column v-if="!updatePending">
    <v-flex xs1>
      <h1>Which seems <em>harder</em>?</h1>
    </v-flex>

    <v-layout row wrap>
      <v-btn v-on:click="vote('a')" color="success ma-5"><v-icon>check</v-icon></v-btn>
      <card-loader class="ma-2" v-bind:qualified_id="id1" />
    </v-layout>

    <v-layout row wrap>
      <v-btn v-on:click="vote('b')" color="success ma-5"><v-icon>check</v-icon></v-btn>
      <card-loader class="ma-2" v-bind:qualified_id="id2" />
    </v-layout>
  </v-layout>
</template>

<script lang="ts">
import CardLoader from '@/components/Study/CardLoader.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import { StudySessionItem } from '@/db/contentSource';
import { CardData } from '@/db/types';
import { adjustCourseScores, CourseElo } from '@/tutor/Elo';
import { log } from 'util';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { CourseDB, getCourseConfig, updateCardElo } from '../../db/courseDB';
import { CourseConfig } from '../../server/types';
import SkldrVue from '../../SkldrVue';

@Component({
  components: {
    CardViewer,
    CardLoader,
  },
})
export default class ELOModerator extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private courseDB: CourseDB;

  private updatePending: boolean = true;
  private _courseConfig: CourseConfig;

  public cards: {
    courseId: string;
    cardId: string;
    elo: CourseElo;
    count: number;
  }[] = [];
  public id1: string = '';
  public id2: string = '';
  public elo1: CourseElo;
  public elo2: CourseElo;

  private async created() {
    // const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    // this.userIsRegistered = userCourses.courses.filter((c) => {
    //   return c.courseID === this._id && (c.status === 'active' || c.status === undefined)
    // }).length === 1;
    this.courseDB = new CourseDB(this._id);

    this._courseConfig = (await getCourseConfig(this._id))!;
    this.getNewCards();
  }

  private vote(x: 'a' | 'b') {
    const scores = adjustCourseScores(this.elo1, this.elo2, x === 'a' ? 1 : 0, {
      globalOnly: true,
    });

    updateCardElo(this._id, this.cards[0].cardId, scores.userElo);
    updateCardElo(this._id, this.cards[1].cardId, scores.cardElo);

    this.getNewCards();
  }

  private async getNewCards() {
    this.updatePending = true;
    this.cards = await this.courseDB.getInexperiencedCards();

    // console.log('Comparing:\n\t' + JSON.stringify(this.cards));

    this.id1 = '';
    this.id2 = '';

    this.id1 = `${this._id}-${this.cards[0].cardId}`;
    this.id2 = `${this._id}-${this.cards[1].cardId}`;

    this.elo1 = this.cards[0].elo;
    this.elo2 = this.cards[1].elo;

    this.updatePending = false;
  }
}
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

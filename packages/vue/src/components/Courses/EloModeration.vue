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

  public card1: StudySessionItem;
  public card2: StudySessionItem;
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
    const scoreA = parseInt(this.card1.qualifiedID.split('-')[2]);
    const scoreB = parseInt(this.card2.qualifiedID.split('-')[2]);

    const scores = adjustCourseScores(this.elo1, this.elo2, x === 'a' ? 1 : 0, {
      globalOnly: true,
    });

    console.log(`Updating:
    ${this.card1.cardID}: ${scoreA} -> ${scores.userElo}
    ${this.card2.cardID}: ${scoreB} -> ${scores.cardElo}`);

    updateCardElo(this.card1.courseID, this.card1.cardID, scores.userElo);
    updateCardElo(this.card2.courseID, this.card2.cardID, scores.cardElo);

    this.getNewCards();
  }

  private async getNewCards() {
    this.updatePending = true;
    const cards = await this.courseDB.getCardsCenteredAtELO({
      limit: 2,
      elo: 'random',
    });

    this.card1 = cards[0];
    this.card2 = cards[1];

    this.id1 = '';
    this.id2 = '';

    this.id1 = cards[0].qualifiedID;
    this.id2 = cards[1].qualifiedID;
    const eloData = await this.courseDB.getCardEloData([this.card1.cardID, this.card2.cardID]);
    this.elo1 = eloData[0];
    this.elo2 = eloData[1];

    console.log(`Loaded cards: ${this.card1.cardID}, ${this.card2.cardID}`);
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

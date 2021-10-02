<template>
  <div v-if="!updatePending">
    <h1>Which seems harder?</h1>
    <!-- <v-card> -->
    A:
    <card-loader :qualified_id="id1" />
    <!-- </v-card> -->
    <!-- <v-card> -->
    B:
    <card-loader :qualified_id="id2" />
    <!-- </v-card> -->
    <v-btn color="primary" @click="getNewCards"></v-btn>
  </div>
</template>

<script lang="ts">
import CardLoader from '@/components/Study/CardLoader.vue';
import CardViewer from '@/components/Study/CardViewer.vue';
import { StudySessionItem } from '@/db/contentSource';
import { log } from 'util';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { CourseDB, getCourseConfig } from '../../db/courseDB';
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

  private async created() {
    const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    // this.userIsRegistered = userCourses.courses.filter((c) => {
    //   return c.courseID === this._id && (c.status === 'active' || c.status === undefined)
    // }).length === 1;
    this.courseDB = new CourseDB(this._id);

    this._courseConfig = (await getCourseConfig(this._id))!;
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

    log(`Loaded cards: ${this.card1.cardID}, ${this.card2.cardID}`);
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

<template>
  <div v-if="!updatePending">
    <h1 class="display-1"><router-link to="/q">Quilts</router-link> / {{ _courseConfig.name }}</h1>

    <p class="body-2">
      {{ _courseConfig.description }}
    </p>

    <transition name="component-fade" mode="out-in">
      <div v-if="userIsRegistered">
        <router-link :to="`/study/${_id}`">
          <v-btn color="success">Start a study session</v-btn>
        </router-link>
        <router-link :to="`/edit/${_id}`">
          <v-btn dark color="indigo lighten-1" title="Add content to this course">
            <v-icon left>add</v-icon>
            Add content
          </v-btn>
        </router-link>
        <router-link :to="`/courses/${_id}/elo`">
          <v-btn dark color="green darken-2" title="Rank course content for difficulty">
            <v-icon left>style</v-icon>
            Arrange
          </v-btn>
        </router-link>
        <v-btn color="error" small outline @click="drop">Drop this course</v-btn>
      </div>
      <div v-else>
        <v-btn color="primary" @click="register">Register</v-btn>
        <router-link :to="`/q/${_id}/preview`">
          <v-btn outline color="primary">Start a trial study session</v-btn>
        </router-link>
      </div>
    </transition>

    <v-card>
      <v-toolbar dense>
        <v-toolbar-title>Tags</v-toolbar-title>
        <v-spacer></v-spacer>
        {{ tags.length }}
      </v-toolbar>
      <v-card-text>
        <v-chip outline v-for="(tag, i) in tags" v-bind:key="i">
          <router-link :to="`/q/${_id}/tags/${tag.name}`">
            {{ tag.name }}
          </router-link>
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card>
      <v-toolbar dense>
        <v-toolbar-title>Exercises</v-toolbar-title>
        <v-spacer></v-spacer>
        {{ questionCount }}
      </v-toolbar>
      <v-list two-line>
        <template v-for="(c, i) in cards">
          <v-list-tile v-bind:key="c">
            <v-list-tile-content>
              <v-list-tile-title>
                {{ cardPreview[c] }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ c.split('-')[2] }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon>
                <v-icon>more</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn icon>
                <v-icon>zoom_in</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-list>
    </v-card>

    <!-- <div style="background-color: red; padding: 15px; margin: 10px">
      <v-text-field v-model="elo" label="elo" id="id" type="number"></v-text-field>
      <v-text-field v-model="num" label="CardCount" id="id" type="number"></v-text-field>
      <v-btn color="success" @click="getCards">GetCards!</v-btn>
    </div> -->

    <midi-config v-if="isPianoCourse" :_id="_id" />
  </div>
</template>

<script lang="ts">
import MidiConfig from '@/courses/piano/utility/MidiConfig.vue';
import Courses from '@/courses';
import { log } from 'util';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { getCourseDB, getCourseDoc, getCourseDocs } from '../../db';
import { CourseDB, getCourseConfig, getCourseTagStubs } from '../../db/courseDB';
import { CardData, DisplayableData, DocType, Tag } from '../../db/types';
import { CourseConfig } from '../../server/types';
import SkldrVue from '../../SkldrVue';
import { displayableDataToViewData } from '@/base-course/Interfaces/ViewData';

@Component({
  components: {
    MidiConfig,
  },
})
export default class CourseInformation extends SkldrVue {
  @Prop({ required: true }) private _id: string;
  private courseDB: CourseDB;

  private get isPianoCourse(): boolean {
    return this._courseConfig.name.toLowerCase().includes('piano');
  }

  private tagStr(t: Tag) {}

  private cards: string[] = [];
  private cardData: { [card: string]: string[] } = {};
  private cardPreview: { [card: string]: string } = {};

  private nameRules: Array<(value: string) => string | boolean> = [
    (value) => {
      const max = 30;
      if (value.length > max) {
        return `Course name must be ${max} characters or less`;
      } else {
        return true;
      }
    },
  ];

  private updatePending: boolean = true;

  private addingContent: boolean = false;
  private availableCourses: CourseConfig[] = [];
  private selectedCourse: string = '';
  private availableTags: Tag[] = [];
  private selectedTags: string[] = [];

  private _courseConfig: CourseConfig;
  public userIsRegistered: boolean = false;
  private questionCount: number;
  private tags: Tag[] = [];

  private async created() {
    this.courseDB = new CourseDB(this._id);
    this.cards = await this.courseDB.getCardsByEloLimits();

    const hydratedCardData = (
      await getCourseDocs<CardData>(
        this._id,
        this.cards.map((c) => c.split('-')[1]),
        {
          include_docs: true,
        }
      )
    ).rows.map((r) => r.doc!);

    hydratedCardData.forEach((c) => {
      this.cardData[c._id] = c.id_displayable_data;
    });

    this.cards.forEach(async (c) => {
      console.log(`generating preview for ${c}`);
      const _courseID: string = c.split('-')[0];
      const _cardID: string = c.split('-')[1];

      const tmpCardData = hydratedCardData.find((c) => c._id == _cardID)!;
      const tmpView = Courses.getView(tmpCardData.id_view);

      // todo 143 / perf: this fetch is non-blocking, but is making a db
      // query for each card. much much better to batch query by allDocs
      // with keys list
      const tmpDataDocs = tmpCardData.id_displayable_data.map((id) => {
        return getCourseDoc<DisplayableData>(_courseID, id, {
          attachments: false,
          binary: true,
        });
      });

      Promise.all(tmpDataDocs).then((docs) => {
        docs.forEach((doc) => {
          const tmpData = [];
          tmpData.unshift(displayableDataToViewData(doc));

          const view = new tmpView();
          (view as any).data = tmpData;

          this.cardPreview[c] = view.toString();
        });
      });
    });

    const userCourses = await this.$store.state._user!.getCourseRegistrationsDoc();
    this.userIsRegistered =
      userCourses.courses.filter((c) => {
        return c.courseID === this._id && (c.status === 'active' || c.status === undefined);
      }).length === 1;
    const db = await getCourseDB(this._id);
    this._courseConfig = (await getCourseConfig(this._id))!;
    this.questionCount = (
      await db.find({
        selector: {
          docType: DocType.CARD,
        },
        limit: 1000,
      })
    ).docs.length;
    this.tags = (await getCourseTagStubs(this._id)).rows.map((r) => r.doc!);
    this.updatePending = false;
  }

  private async register() {
    log(`Registering for ${this._id}`);
    const res = await this.$store.state._user!.registerForCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = true;
    }
    // this.userIsRegistered = !this.userIsRegistered;
  }
  private async drop() {
    log(`Dropping course ${this._id}`);
    const res = await this.$store.state._user!.dropCourse(this._id);
    if (res.ok) {
      this.userIsRegistered = false;
    }
    // this.userIsRegistered = !this.userIsRegistered;
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

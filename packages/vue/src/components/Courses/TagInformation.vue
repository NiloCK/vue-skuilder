<template>
  <div>
    <!-- todo: -->
    <h1>
      <router-link :to="`/q/${course.name}`">{{ course.name }}</router-link> > Tag: {{ tag.name }}
    </h1>
    <br />
    <p>{{ tag.taggedCards.length }} card{{ tag.taggedCards.length === 1 ? '' : 's' }}</p>

    <v-text-field
      ref="snippetEditor"
      outlined
      v-bind:readonly="!editingSnippet"
      v-bind:counter="editingSnippet"
      label="Brief tag description:"
      v-model="snippetModel"
      placeholder="No snippet yet - add one!"
      type="text"
    >
      <template v-slot:prepend>
        <span v-if="editingSnippet">
          <v-icon color="primary" @click="saveSnippet">mdi-content-save</v-icon>
        </span>
        <v-icon v-else color="primary" @click="editSnippet">mdi-pencil</v-icon>
      </template>
      <template v-slot:append>
        <v-icon v-if="editingSnippet" @click="cancelEditSnippet">mdi-cancel</v-icon>
        <v-fade-transition leave-absolute>
          <!-- spinner while awaiting async write of edits -->
          <v-progress-circular v-if="snippetSaving" size="20" color="info" indeterminate></v-progress-circular>
        </v-fade-transition>
      </template>
    </v-text-field>

    <v-text-field
      ref="wikiEditor"
      outlined
      v-bind:readonly="!editingWiki"
      v-bind:counter="editingWiki"
      label="Extended tag description:"
      v-model="wikiModel"
      placeholder="No wiki yet - consider adding one!"
      textarea
    >
      <template v-slot:prepend>
        <span v-if="editingWiki">
          <v-icon color="primary" @click="saveWiki">mdi-content-save</v-icon>
        </span>
        <v-icon v-else color="primary" @click="editWiki">mdi-pencil</v-icon>
      </template>
      <template v-slot:append>
        <v-icon v-if="editingWiki" @click="cancelEditWiki">mdi-cancel</v-icon>
        <v-fade-transition leave-absolute>
          <!-- spinner while awaiting async write of edits -->
          <v-progress-circular v-if="wikiSaving" size="20" color="info" indeterminate></v-progress-circular>
        </v-fade-transition>
      </template>
    </v-text-field>

    <course-card-browser v-bind:_id="_courseId" v-bind:_tag="_id" />
  </div>
</template>

<script lang="ts">
import { getCredentialledCourseConfig } from '@/db/courseAPI';
import { getTag, updateTag } from '@/db/courseDB';
import { DocType, Tag } from '@/db/types';
import { Status } from '@/enums/Status';
import { CourseConfig } from '@/server/types';
import SkldrVue from '@/SkldrVue';
import { Component, Prop } from 'vue-property-decorator';
import { alertUser } from '../SnackbarService.vue';
import CourseCardBrowser from './CourseCardBrowser.vue';

@Component({
  components: { CourseCardBrowser },
})
export default class TagInformation extends SkldrVue {
  @Prop({ required: true }) _id: string = '';
  @Prop({ required: true }) _courseId: string = '';

  public $refs: {
    snippetEditor: HTMLInputElement;
    wikiEditor: HTMLInputElement;
  };

  public snippetModel: string = '';
  public editingSnippet: boolean = false;
  public snippetSaving: boolean = false;

  public wikiModel: string = '';
  public editingWiki: boolean = false;
  public wikiSaving: boolean = false;

  public tag: Tag = {
    course: this._courseId,
    name: this._id,
    snippet: '',
    wiki: '',
    taggedCards: [],
    docType: DocType.TAG,
  };
  public course: CourseConfig = {
    courseID: this._courseId,
    name: '',
    description: '',
    public: false,
    deleted: false,

    dataShapes: [],
    questionTypes: [],

    creator: '',
    admins: [],
    moderators: [],
  };

  public editSnippet() {
    console.log('[TagInformation] EditSnip');
    this.editingSnippet = true;
    this.$refs.snippetEditor.focus(); // not doing anything
  }
  public editWiki() {
    console.log('[TagInformation] EditWiki');
    this.editingWiki = true;
    this.$refs.wikiEditor.focus(); // not doing anything
  }

  public async saveSnippet() {
    this.snippetSaving = true;

    const update = await updateTag({
      ...this.tag,
      snippet: this.snippetModel,
    });

    if (update.ok) {
      console.log('[TagInformation] OK');
      // update local copy
      this.tag.snippet = this.snippetModel;
      alertUser({
        text: `Updated applied - thanks!`,
        status: Status.ok,
      });
    } else {
      alertUser({
        text: `error in applying update!`,
        status: Status.error,
      });
    }

    // leave edit-mode
    this.editingSnippet = false;
    this.snippetSaving = false;
  }

  public async saveWiki() {
    this.wikiSaving = true;

    const update = await updateTag({
      ...this.tag,
      wiki: this.wikiModel,
    });

    if (update.ok) {
      // update local copy
      this.tag.wiki = this.wikiModel;
      alertUser({
        text: `Updated applied - thanks!`,
        status: Status.ok,
      });
    } else {
      alertUser({
        text: `error in applying update!`,
        status: Status.error,
      });
    }

    // leave edit-mode
    this.editingWiki = false;
    this.wikiSaving = false;
  }

  public cancelEditSnippet() {
    console.log('[TagInformation] Cancelling EditSnip');
    this.editingSnippet = false;
    // this.snippetModel = 'test';
    this.snippetModel = this.tag.snippet;
  }
  public cancelEditWiki() {
    this.editingWiki = false;
    this.wikiModel = this.tag.wiki;
  }

  private async created() {
    this.tag = await getTag(this._courseId, this._id);
    this.snippetModel = this.tag.snippet;
    this.wikiModel = this.tag.wiki;
    this.course = await getCredentialledCourseConfig(this._courseId);
  }
}
</script>

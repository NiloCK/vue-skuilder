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
import { ref, onCreated, defineComponent } from 'vue';
import { getCredentialledCourseConfig } from '@/db/courseAPI';
import { getTag, updateTag } from '@/db/courseDB';
import { DocType, Tag } from '@/db/types';
import { Status } from '@/enums/Status';
import { CourseConfig } from '@/server/types';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { alertUser } from '../SnackbarService.vue';
import CourseCardBrowser from './CourseCardBrowser.vue';

export default defineComponent({
  name: 'TagInformation',
  components: { CourseCardBrowser },
  props: {
    _id: {
      type: String,
      required: true
    },
    _courseId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { log } = SkldrComposable();
    const snippetEditor = ref<HTMLInputElement | null>(null);
    const wikiEditor = ref<HTMLInputElement | null>(null);
    
    const snippetModel = ref('');
    const editingSnippet = ref(false);
    const snippetSaving = ref(false);
    
    const wikiModel = ref('');
    const editingWiki = ref(false);
    const wikiSaving = ref(false);
    
    const tag = ref<Tag>({
      course: props._courseId,
      name: props._id,
      snippet: '',
      wiki: '',
      taggedCards: [],
      docType: DocType.TAG,
    });
    
    const course = ref<CourseConfig>({
      courseID: props._courseId,
      name: '',
      description: '',
      public: false,
      deleted: false,
      dataShapes: [],
      questionTypes: [],
      creator: '',
      admins: [],
      moderators: [],
    });

    const editSnippet = () => {
      log('EditSnip');
      editingSnippet.value = true;
      snippetEditor.value?.focus();
    };

    const editWiki = () => {
      log('EditWiki');
      editingWiki.value = true;
      wikiEditor.value?.focus();
    };

    const saveSnippet = async () => {
      snippetSaving.value = true;
      
      const update = await updateTag({
        ...tag.value,
        snippet: snippetModel.value,
      });

      if (update.ok) {
        log('OK');
        tag.value.snippet = snippetModel.value;
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

      editingSnippet.value = false;
      snippetSaving.value = false;
    };

    const saveWiki = async () => {
      wikiSaving.value = true;

      const update = await updateTag({
        ...tag.value,
        wiki: wikiModel.value,
      });

      if (update.ok) {
        tag.value.wiki = wikiModel.value;
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

      editingWiki.value = false;
      wikiSaving.value = false;
    };

    const cancelEditSnippet = () => {
      log('Cancelling EditSnip');
      editingSnippet.value = false;
      snippetModel.value = tag.value.snippet;
    };

    const cancelEditWiki = () => {
      editingWiki.value = false;
      wikiModel.value = tag.value.wiki;
    };

    onCreated(async () => {
      tag.value = await getTag(props._courseId, props._id);
      snippetModel.value = tag.value.snippet;
      wikiModel.value = tag.value.wiki;
      course.value = await getCredentialledCourseConfig(props._courseId);
    });

    return {
      snippetEditor,
      wikiEditor,
      snippetModel,
      editingSnippet,
      snippetSaving,
      wikiModel,
      editingWiki,
      wikiSaving,
      tag,
      course,
      editSnippet,
      editWiki,
      saveSnippet,
      saveWiki,
      cancelEditSnippet,
      cancelEditWiki
    };
  }
});
</script>

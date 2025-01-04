<template>
  <div>
    <vue-tags-input
      v-model="tag"
      :tags="tags"
      :autocomplete-items="autoCompleteSuggestions"
      :separators="separators"
      :add-on-key="separators"
      @tags-changed="tagsChanged"
    >
      <template v-slot:autocomplete-item="props">
        <div class="autocomplete-item" :class="{ 'is-active': props.selected }">
          <span class="tag-name">{{ props.item.text }}</span>
          <span v-if="props.item.data && props.item.data.snippet" class="tag-snippet">
            - {{ props.item.data.snippet }}
          </span>
        </div>
      </template>
    </vue-tags-input>

    <v-btn v-if="!hideSubmit" color="success" @click="submit" :loading="loading">Save Changes</v-btn>
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onCreated } from 'vue';
import { addTagToCard } from '@/db/courseAPI';
import { getAppliedTags, getCourseTagStubs, removeTagFromCard } from '@/db/courseDB';
import type { Tag } from '@/db/types';
import { SkldrComposable } from '@/mixins/SkldrComposable';
// @ts-ignore
import VueTagsInput from '@johmun/vue-tags-input';

interface TagObject {
  text: string;
  style?: string;
  classes?: string;
  data?: {
    snippet: string;
  };
}

export default defineComponent({
  name: 'SkTagsInput',
  components: {
    VueTagsInput,
  },
  props: {
    courseID: {
      type: String,
      required: true,
      default: '',
    },
    cardID: {
      type: String,
      required: false,
      default: '',
    },
    hideSubmit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { log, error } = SkldrComposable();
    const loading = ref(true);
    const tag = ref('');
    const tags = ref<TagObject[]>([]);
    const initialTags = ref<string[]>([]);
    const availableCourseTags = ref<Tag[]>([]);
    const separators = [';', ',', ' '];

    const autoCompleteSuggestions = computed((): TagObject[] => {
      return availableCourseTags.value
        .filter(availableTag => {
          return availableTag.name.toLowerCase().indexOf(tag.value.toLowerCase()) !== -1;
        })
        .map(availableTag => ({
          text: availableTag.name,
          data: {
            snippet: availableTag.snippet,
          },
        }));
    });

    const tagsChanged = (newTags: TagObject[]) => {
      log(`Tags changing: ${JSON.stringify(newTags)}`);
      tags.value = newTags;
    };

    const getAppliedTags = async () => {
      initialTags.value = [];
      tags.value = [];
      try {
        const appliedDocsFindResult = await getAppliedTags(props.courseID, props.cardID);
        appliedDocsFindResult.rows.forEach(row => {
          log(`The following tag is applied:\n\t${JSON.stringify(row)}`);
          tags.value.push({
            text: row!.value.name,
            style: '',
            classes: '',
          });
        });
        initialTags.value = tags.value.map(tag => tag.text);
      } catch (e) {
        error(`Error in init-getAppliedTags: ${JSON.stringify(e)}, ${e}`);
      } finally {
        loading.value = false;
      }
    };

    const updateAvailableCourseTags = async () => {
      try {
        availableCourseTags.value = (await getCourseTagStubs(props.courseID)).rows.map(row => {
          log(`available tag: ${JSON.stringify(row)}`);
          return row.doc! as Tag;
        });
      } catch (e) {
        error(`Error in init-availableCourseTags: ${JSON.stringify(e)}`);
      }
    };

    const submit = async () => {
      log(`tagsInput is submitting...`);
      loading.value = true;

      try {
        await Promise.all(
          tags.value.map(async currentTag => {
            if (!initialTags.value.includes(currentTag.text)) {
              try {
                await addTagToCard(props.courseID, props.cardID, currentTag.text);
                log(`Successfully added tag: ${currentTag.text}`);
              } catch (error) {
                error(`Failed to add tag ${currentTag.text}:`, error);
              }
            }
          })
        );
      } catch (e) {
        error(`Exception adding tags: ${JSON.stringify(e)}`);
      }

      try {
        await Promise.all(
          initialTags.value.map(async initialTag => {
            if (tags.value.filter(tag => tag.text === initialTag).length === 0) {
              try {
                await removeTagFromCard(props.courseID, props.cardID, initialTag);
                log(`Successfully removed tag: ${initialTag}`);
              } catch (error) {
                error(`Failed to remove tag ${initialTag}:`, error);
              }
            }
          })
        );
      } catch (e) {
        error(`Exception removing tags: ${JSON.stringify(e)}`);
      }
      loading.value = false;
    };

    watch(() => props.cardID, getAppliedTags);
    watch(() => props.courseID, updateAvailableCourseTags);

    onCreated(async () => {
      await updateAvailableCourseTags();
      await getAppliedTags();
    });

    return {
      loading,
      tag,
      tags,
      separators,
      autoCompleteSuggestions,
      tagsChanged,
      submit,
    };
  },
});
</script>

<style scoped>
.vue-tags-input {
  max-width: 100%;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  padding: 5px;
}

.autocomplete-item.is-active {
  background-color: #e8e8e8;
}

.autocomplete-item.is-active > .tag-name {
  background-color: #5c6bc0;
  color: white;
}

.tag-name {
  background-color: #e0e0e0;
  color: #333;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 5px;
}

.tag-snippet {
  color: #666;
  font-size: 0.9em;
}

.autocomplete-item.is-active .tag-snippet {
  color: #333; /* Ensure snippet text is visible when item is active */
}
</style>
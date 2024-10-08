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
import SkldrVue from '@/SkldrVue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { addTagToCard } from '@/db/courseAPI';
import { getAppliedTags, getCourseTagStubs, removeTagFromCard } from '@/db/courseDB';
import { Tag } from '@/db/types';
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

@Component({
  components: {
    VueTagsInput,
  },
})
export default class SkTagsInput extends SkldrVue {
  @Prop({
    required: true,
    default: '',
  })
  public courseID: string;
  @Prop({
    required: false,
    default: '',
  })
  public cardID: string;
  @Prop({
    required: false,
    default: false,
  })
  public hideSubmit = false;

  public loading: boolean = true;

  public tag: string = ''; // 'current' tag input
  public tags: TagObject[] = [];
  public initialTags: string[] = [];
  public availableCourseTags: Tag[] = [];

  public readonly separators: string[] = [';', ',', ' '];

  public tagsChanged(newTags: TagObject[]) {
    this.log(`Tags changing: ${JSON.stringify(newTags)}`);
    this.tags = newTags;
  }

  public get autoCompleteSuggestions(): TagObject[] {
    return this.availableCourseTags
      .filter(availableTag => {
        return availableTag.name.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
      })
      .map(availableTag => {
        return {
          text: availableTag.name,
          data: {
            snippet: availableTag.snippet,
          },
        };
      });
  }

  public async created() {
    await this.updateAvailableCourseTags();
    await this.getAppliedTags();
  }

  @Watch('cardID')
  private async getAppliedTags() {
    this.initialTags = [];
    this.tags = [];
    try {
      const appliedDocsFindResult = await getAppliedTags(this.courseID, this.cardID);
      appliedDocsFindResult.rows.forEach(row => {
        this.log(`The following tag is applied:
\t${JSON.stringify(row)}`);
        this.tags.push({
          text: row!.value.name,
          style: '',
          classes: '',
        });
      });
      this.initialTags = this.tags.map(tag => tag.text);
    } catch (e) {
      this.error(`Error in init-getAppliedTags: ${JSON.stringify(e)}, ${e}`);
    } finally {
      this.loading = false;
    }
  }

  @Watch('courseID')
  public async updateAvailableCourseTags() {
    try {
      this.availableCourseTags = (await getCourseTagStubs(this.courseID)).rows.map(row => {
        this.log(`available tag: ${JSON.stringify(row)}`);
        return row.doc! as Tag;
      });
    } catch (e) {
      this.error(`Error in init-availableCourseTags: ${JSON.stringify(e)}`);
    }
  }

  public async submit() {
    this.log(`tagsInput is submitting...`);
    this.loading = true;

    try {
      // 'upload' each 'tag' that's not an initialTag
      await Promise.all(
        this.tags.map(async currentTag => {
          if (!this.initialTags.includes(currentTag.text)) {
            try {
              await addTagToCard(this.courseID, this.cardID, currentTag.text);
              this.log(`Successfully added tag: ${currentTag.text}`);
            } catch (error) {
              this.error(`Failed to add tag ${currentTag.text}:`, error);
            }
          }
        })
      );
    } catch (e) {
      this.error(`Exception adding tags: ${JSON.stringify(e)}`);
    }

    try {
      // 'remove' initialTags that are no longer in 'tags'
      await Promise.all(
        this.initialTags.map(async initialTag => {
          if (
            this.tags.filter(tag => {
              return tag.text === initialTag;
            }).length === 0
          ) {
            try {
              await removeTagFromCard(this.courseID, this.cardID, initialTag);
              this.log(`Successfully removed tag: ${initialTag}`);
            } catch (error) {
              this.error(`Failed to remove tag ${initialTag}:`, error);
            }
          }
        })
      );
    } catch (e) {
      this.error(`Exception removing tags: ${JSON.stringify(e)}`);
    }
    this.loading = false;
  }
}
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
<template>
  <div>
    <vue-tags-input
      v-model="tag"
      :tags="tags"
      :autocomplete-items="autoCompleteSuggestions"
      :separators="separators"
      :add-on-key="separators"
      @tags-changed="tagsChanged"
    />

    <v-btn v-if="!hideSubmit" color="success" @click="submit" :loading="loading">Save Changes</v-btn>
  </div>
</template>

<script lang="ts">
import SkldrVue from '@/SkldrVue';
import { Component, Prop, Watch } from 'vue-property-decorator';
// @ts-ignore
import VueTagsInput from '@johmun/vue-tags-input';
import { getCourseTagStubs, getAppliedTags, removeTagFromCard, addTagToCard, createTag } from '@/db/courseDB';
import { Tag } from '@/db/types';
import { log } from 'util';

interface TagObject {
  text: string;
  style: string;
  classes: string;
}

@Component({
  components: {
    VueTagsInput,
  },
})
export default class SkTagsInput extends SkldrVue {
  @Prop({
    required: true,
  })
  public courseID: string;
  @Prop({
    required: false,
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

  public tagsChanged(newTags: any) {
    log(`Tags changing: ${JSON.stringify(newTags)}`);
    this.tags = newTags;
  }

  public get autoCompleteSuggestions(): TagObject[] {
    return this.availableCourseTags
      .filter((availableTag) => {
        return availableTag.name.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
      })
      .map((availableTag) => {
        return {
          text: availableTag.name,
          style: '',
          classes: '',
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
      // this.tags = appliedDocsFindResult.map((doc) => {
      //   return {
      //     text: doc._id,
      //     style: '',
      //     classes: ''
      //   };
      // });
      appliedDocsFindResult.rows.forEach((row) => {
        log(`The following tag is applied:
\t${JSON.stringify(row)}`);
        this.tags.push({
          text: row!.value.name,
          style: '',
          classes: '',
        });
      });
      this.tags.forEach((tag) => {
        this.initialTags.push(tag.text);
      });
    } catch (e) {
      log(`Error in init-getAppliedTags: ${JSON.stringify(e)}, ${e}`);
    } finally {
      this.loading = false;
    }
  }

  @Watch('courseID')
  public async updateAvailableCourseTags() {
    try {
      this.availableCourseTags = (await getCourseTagStubs(this.courseID)).rows.map((row) => {
        log(`available tag: ${JSON.stringify(row)}`);
        return row.doc!;
      });
    } catch (e) {
      log(`Error in init-availableCourseTags: ${JSON.stringify(e)}`);
    }
  }

  public async submit() {
    log(`tagsInput is submitting...`);
    this.loading = true;

    try {
      // 'upload' each 'tag' that's not an initialTag
      this.tags.forEach(async (currentTag) => {
        if (
          this.initialTags.find((initTag) => {
            return initTag === currentTag.text;
          }) === undefined
        ) {
          log(`adding tag: ${currentTag.text}...`);
          await addTagToCard(this.courseID, this.cardID, currentTag.text);
        }
      });
    } catch (e) {
      log(`Exception adding tags: ${JSON.stringify(e)}`);
    }

    try {
      // 'remove' initialTags that are no longer in 'tags'
      this.initialTags.forEach(async (tag) => {
        if (
          this.tags.filter((initTag) => {
            return initTag.text === tag;
          }).length === 0
        ) {
          await removeTagFromCard(this.courseID, this.cardID, tag);
        }
      });
    } catch (e) {
      log(`Exception removing tags: ${JSON.stringify(e)}`);
    }
    this.loading = false;
  }
}
</script>

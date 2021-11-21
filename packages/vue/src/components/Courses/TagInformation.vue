<template>
  <div>
    HELLO fawefawefawef
    <h1>{{ tag.name }}</h1>
    <br />
    <p>{{ tag.taggedCards.length }} cards</p>
    <p>{{ tag.snippit }}</p>
    <p>{{ tag.wiki }}</p>
  </div>
</template>

<script lang="ts">
import { getTag } from '@/db/courseDB';
import { DocType, Tag } from '@/db/types';
import SkldrVue from '@/SkldrVue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class TagInformation extends SkldrVue {
  @Prop({ required: true }) _id: string = '';
  @Prop({ required: true }) _courseId: string = '';

  public tag: Tag = {
    course: this._courseId,
    name: this._id,
    snippit: '',
    wiki: '',
    taggedCards: [],
    docType: DocType.TAG,
  };

  private async created() {
    this.tag = await getTag(this._courseId, this._id);
  }
}
</script>

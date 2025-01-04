<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import Viewable from '@/base-course/Viewable';

interface AnkiField {
  font: string;
  media: string[];
  position: number;
  rtl: boolean;
  size: number;
  sticky: boolean;
}

interface AnkiTemplate {
  afmt: string;
  bafmt: string;
  bqfmt: string;
  qfmt: string;
  did: any;
  name: string;
  position: number;
}

interface AnkiNoteModel {
  _id: string;
  css: string;
  fields: AnkiField[];
  latexPost: string;
  latexPre: string;
  name: string;
  req: any;
  shortf: number;
  tags: string[];
  templates: AnkiTemplate[];
  type: number;
  vers: any[];
}

const template1 = {
  // ... existing template1 object
};

const basicTemplate = {
  // ... existing basicTemplate object
};

const noteData = {
  // ... existing noteData object
};

export default defineComponent({
  name: 'AnkiCard',
  mixins: [SkldrVueMixin],
  extends: Viewable
});
</script>

<template>
  <div>
    <v-textarea v-if="testRoute" outline label="Type Here" name="name" v-model="md" />
    <span v-for="(token, i) in tokens" v-bind:key="i">
      <md-token-renderer v-if="token.type" v-bind:token="token" v-bind:last="i === tokens.length - 1" />
      <audio-auto-player v-else-if="token.audio" v-bind:src="token.audio" />
      <!-- // [ ] insert img display here.  "if token.image ? (also see if the audio aboke is functional)" -->
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import MdTokenRenderer from './MdTokenRenderer.vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import type { ISkldrMixin } from '@/mixins/SkldrVueMixin';

type SkldrToken =
  | marked.Token
  | {
      type: false;
      audio: string;
    };

export default Vue.extend({
  name: 'MarkdownRenderer',
  
  components: {
    MdTokenRenderer,
  },

  mixins: [SkldrVueMixin],

  props: {
    md: {
      type: String,
      required: true,
    }
  },

  computed: {
    testRoute(): boolean {
      if (this.$route.path === '/md') {
        (this as any).md = 'test md';
        return true;
      } else {
        return false;
      }
    },

    tokens(): SkldrToken[] {
      const tokens = marked.lexer(this.md);
      if (this.testRoute) {
        tokens.forEach(t => {
          (this as ISkldrMixin).log(JSON.stringify(t));
        });
      }
      return tokens;
    }
  }
});
</script>

<style lang="css" scoped></style>

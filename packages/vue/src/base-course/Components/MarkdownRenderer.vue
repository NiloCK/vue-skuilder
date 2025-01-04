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
import { defineComponent, computed } from 'vue';
import MdTokenRenderer from './MdTokenRenderer.vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import type { SkldrToken } from '@/types';

export default defineComponent({
  name: 'MarkdownRenderer',
  
  components: {
    MdTokenRenderer,
  },

  mixins: [SkldrVueMixin],
  
  props: {
    md: {
      type: String,
      required: true
    }
  },

  setup(props, { emit }) {
    const testRoute = computed(() => {
      if (window?.location?.pathname === '/md') {
        props.md = 'test md';
        return true;
      }
      return false;
    });

    const tokens = computed(() => {
      const tokens = marked.lexer(props.md);
      if (testRoute.value) {
        tokens.forEach(t => {
          console.log(JSON.stringify(t));
        });
      }
      return tokens as SkldrToken[];
    });

    return {
      testRoute,
      tokens
    };
  }
});
</script>

<style lang="css" scoped></style>

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
import { defineComponent, PropType } from 'vue';
import MdTokenRenderer from './MdTokenRenderer.vue';
import { marked } from 'marked';
import SkldrVueMixin, { ISkldrMixin } from '@/mixins/SkldrVueMixin';

type SkldrToken =
  | marked.Token
  | {
      type: false;
      audio: string;
    };

// Using Options API with mixin
export default defineComponent({
  name: 'MarkdownRenderer',
  components: {
    MdTokenRenderer,
  },
  mixins: [SkldrVueMixin],
  props: {
    md: {
      type: String as PropType<string>,
      required: true,
    },
  },
  computed: {
    tokens(): SkldrToken[] {
      return marked.lexer(this.md);
    },
  },
});
</script>

<style lang="css" scoped></style>

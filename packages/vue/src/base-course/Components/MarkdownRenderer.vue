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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import MdTokenRenderer from './MdTokenRenderer.vue';
import { marked, Tokenizer } from 'marked';
import hljs from 'highlight.js';

type SkldrToken =
  | marked.Token
  | {
      type: false;
      audio: string;
    };

@Component({
  components: {
    MdTokenRenderer,
  },
})
export default class MarkdownRenderer extends SkldrVue {
  @Prop({
    required: true,
    type: String,
  })
  md: string;

  public get testRoute(): boolean {
    // console.log(`Route: ${this.$route.path}`);

    if (this.$route.path === '/md') {
      this.md = 'test md';
      return true;
    } else {
      return false;
    }
  }

  public get tokens(): SkldrToken[] {
    // marked.setOptions({
    //   highlight: (code, lang, cb) => {
    //     this.log(`highlighting!`);
    //     hljs.highlight(lang, code)
    //   }
    // })
    const tokens = marked.lexer(this.md);
    if (this.testRoute) {
      tokens.forEach(t => {
        this.log(JSON.stringify(t));
      });
    }
    return tokens;
  }
}
</script>

<style lang="css" scoped></style>

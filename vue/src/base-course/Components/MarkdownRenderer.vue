<template>
  <div>
    <v-textarea v-if="testRoute" outline label="Type Here" name="name" v-model="md" />
    <md-token-renderer v-for="(token, i) in tokens" :key="i" :token="token" :last="i === tokens.length - 1" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import MdTokenRenderer from './MdTokenRenderer.vue';
import marked, { Tokenizer } from 'marked';
import hljs from 'highlight.js';

@Component({
  components: {
    MdTokenRenderer,
  },
})
export default class MarkdownRenderer extends Vue {
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

  public get tokens(): marked.TokensList {
    // marked.setOptions({
    //   highlight: (code, lang, cb) => {
    //     console.log(`highlighting!`);
    //     hljs.highlight(lang, code)
    //   }
    // })
    const tokens = marked.lexer(this.md);
    if (this.testRoute) {
      tokens.forEach(t => {
        console.log(JSON.stringify(t));
      });
    }
    return tokens;
  }
}
</script>

<style lang="css" scoped></style>

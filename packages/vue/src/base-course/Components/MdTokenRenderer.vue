<template>
  <span v-if="token.type === 'text' && (!token.tokens || token.tokens.length === 0)">
    <span v-if="isComponent(token)">
      <component v-if="!last" v-bind:is="parsedComponent(token).is" v-bind:text="parsedComponent(token).text" />
    </span>
    <span v-else-if="containsComponent(token)">
      <md-token-renderer v-for="(subTok, j) in splitTextToken(token)" :key="j" :token="subTok" />
    </span>
    <span v-else>{{ token.raw }}</span>
  </span>
  <span v-else-if="token.type === 'text' && token.tokens && token.tokens.length !== 0">
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </span>
  <span v-else-if="token.type === 'heading'">
    <h1 class="display-3" v-if="token.depth === 1">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h1>
    <h2 class="display-2" v-else-if="token.depth === 2">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h2>
    <h3 class="display-1" v-else-if="token.depth === 3">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h3>
    <h4 v-else-if="token.depth === 4">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h4>
    <h5 v-else-if="token.depth === 5">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h5>
    <h6 v-else-if="token.depth === 6">
      <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    </h6>
  </span>
  <strong v-else-if="token.type === 'strong'">
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </strong>

  <p class="headline" v-else-if="token.type === 'paragraph'">
    <span v-if="containsComponent(token)">
      <md-token-renderer
        v-for="(splitTok, j) in splitParagraphToken(token)"
        :key="j"
        :token="splitTok"
        :last="last && token.tokens.length === 1 && j === splitParagraphToken(token).length - 1"
      />
    </span>
    <md-token-renderer
      v-else
      v-for="(subTok, j) in token.tokens"
      :key="j"
      :token="subTok"
      :last="last && token.tokens.length === 1"
    />
  </p>
  <a v-else-if="token.type === 'link'" :href="token.href" :title="token.title">
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </a>

  <ul v-else-if="token.type === 'list' && token.ordered === false">
    <md-token-renderer v-for="(item, j) in token.items" :key="j" :token="item" />
  </ul>
  <ol v-else-if="token.type === 'list' && token.ordered === true">
    <md-token-renderer v-for="(item, j) in token.items" :key="j" :token="item" />
  </ol>
  <li v-else-if="token.type === 'list_item'">
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </li>

  <img v-else-if="token.type === 'image'" :src="token.href" :alt="token.title" />
  <hr v-else-if="token.type === 'hr'" />
  <br v-else-if="token.type === 'br'" />
  <del v-else-if="token.type === 'del'" />
  <!-- ? -->
  <table v-else-if="token.type === 'table'" :align="token.align">
    <thead>
      <th v-for="(h, j) in token.header" :key="j">{{ h }}</th>
    </thead>
    <tbody>
      <tr v-for="(row, r) in token.cells" :key="r">
        <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
      </tr>
    </tbody>
  </table>
  <span v-else-if="token.type === 'html'" v-html="token.html"></span>
  <!-- ? -->
  <highlightjs v-else-if="token.type === 'code'" class="hljs_render pa-2" :language="token.lang" :code="token.text" />
  <code class="codespan" v-else-if="token.type === 'codespan'">{{ token.text }}</code>
  <!-- ? -->
  <blockquote v-else-if="token.type === 'blockquote'">
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </blockquote>
  <span v-else-if="token.type === 'escape'">{{ token.text }}</span>
  <em v-else-if="token.type === 'em'">
    <span v-if="isComponent(token)">
      <component v-if="!last" :is="parsedComponent(token).is" :text="parsedComponent(token).text" />
    </span>
    <md-token-renderer v-else v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
    <md-token-renderer v-for="(subTok, j) in token.tokens" :key="j" :token="subTok" />
  </em>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import marked from 'marked';
import hljs from 'highlight.js';
import FillInInput from '@/courses/default/questions/fillIn/fillInInput.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import {
  containsComponent,
  isComponent,
  splitTextToken,
  splitParagraphToken,
} from '@/courses/default/questions/fillIn';

Vue.use(hljs.vuePlugin);

@Component({
  components: {
    fillIn: FillInInput,
    RadioMultipleChoice,
  },
})
export default class MdTokenRenderer extends Vue {
  @Prop({
    required: true,
    type: Object,
  })
  token: marked.Token;
  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  last: boolean;

  public isComponent(token: marked.Token) {
    return isComponent(token);
  }
  public containsComponent(token: marked.Token) {
    return containsComponent(token);
  }
  public splitTextToken(token: marked.Tokens.Text) {
    return splitTextToken(token);
  }
  public splitParagraphToken(token: marked.Tokens.Paragraph) {
    return splitParagraphToken(token);
  }

  public parsedComponent(
    token: marked.Tokens.Em
  ): {
    is: string;
    text: string;
  } {
    return {
      is: 'fillIn',
      text: token.text,
    };
  }
}
</script>

<style lang="css" scoped>
blockquote {
  border-left: 3px teal solid;
  padding-left: 8px;
}

.codespan {
  padding-left: 3px;
  padding-right: 3px;
  margin-left: 1px;
  margin-right: 1px;
}

/* p {
  margin-bottom: 0px;
} */

/* @import './../../../node_modules/highlight.js/styles/stackoverflow-light.css'; */
/* @import './../../../node_modules/highlight.js/styles/xt256.css'; */
/* @import './../../../node_modules/highlight.js/styles/zenburn.css'; */
/* @import './../../../node_modules/highlight.js/styles/tomorrow.css'; */
/* @import './../../../node_modules/highlight.js/styles/lioshi.css'; */
/* @import './../../../node_modules/highlight.js/styles/rainbow.css'; */
/* @import './../../../node_modules/highlight.js/styles/monokai-sublime.css'; */
@import './../../../node_modules/highlight.js/styles/atelier-seaside-light.css';
</style>

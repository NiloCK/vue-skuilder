<template>
  <span v-if="radioType" class="headline underline"
    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span
  >
  <user-input-string v-else id="input" :icon="false" type="text" :value="text" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FillInBase from './fillInBaseClass';
import UserInputString from '@/base-course/Components/UserInput/UserInputString.vue';

@Component({
  components: {
    UserInputString,
  },
})
export default class FillInInput extends FillInBase {
  @Prop({
    required: true,
  })
  public text: string;

  public inputType: 'text' | 'radio';

  private get radioType() {
    return this.text.split('||').length > 1;
  }

  private created() {
    this.log(`fillinCreated w/ text: ${this.text}`);
    this.text = this.text.substring(2);
    this.text = this.text.substring(0, this.text.length - 2);
    this.log(`fillin text trimmed to: ${this.text}`);

    const split = this.text.split('||');
    if (split.length > 1) {
      this.inputType = 'radio';
    }
  }
}
</script>

<style scoped>
#input {
  display: inline-block;
  min-width: 4em;
  text-align: center;
}

.underline {
  text-decoration: underline;
  text-decoration-style: solid 14px;
}
</style>

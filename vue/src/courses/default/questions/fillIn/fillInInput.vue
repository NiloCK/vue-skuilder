<template>
  <span
   v-if='options !== null'
   class='headline underline'
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  <user-input-string
   v-else
   id="input"
   :icon="false"
   type="text"
   :value="text"
   :disabled="inputType === 'radio'"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FillInBase from './fillInBaseClass';
import UserInputString from '@/base-course/Components/UserInput/UserInputString.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';

@Component({
  components: {
    UserInputString,
    RadioMultipleChoice
  }
})
export default class FillInInput extends FillInBase {
  @Prop({
    required: true
  }) private text: string;

  private inputType: 'text' | 'radio';
  private answer: string | null;
  private options: string[] | null;

  private created() {
    this.text = this.text.substring(2);
    this.text = this.text.substring(0, this.text.length - 2);

    const split = this.text.split('||');
    if (split.length > 1) {
      this.inputType = 'radio';
      this.answer = split[0];
      this.options = split;
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

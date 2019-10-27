<template>
  <user-input-string
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
      this.options = split[1].split('||');
    }
  }
}
</script>

<style scoped>
#input {
  /* border-bottom-width: 2px;
  border-bottom-color: black;
  border-bottom-style: solid; */

  display: inline-block;
  min-width: 4em;
  /* max-width: content-box; */
  /* align: center !important; */
  text-align: center;
}
</style>

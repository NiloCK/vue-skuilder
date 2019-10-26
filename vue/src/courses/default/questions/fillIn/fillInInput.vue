<template>
  <v-text-field
    name="name"
    label="label"
    id="id"
  >{{text}}</v-text-field>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FillInBase from './fillInBaseClass';

@Component({})
export default class FillInText extends FillInBase {
  @Prop({
    required: true
  }) private text: string = '';

  /**
   *
   */
  // constructor(text: string) {
  //   super();
  //   this.text = text;
  // }
}
</script>
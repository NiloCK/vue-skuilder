<template>
  <span class="headline">{{ text }}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FillInBase from './fillInBaseClass';

@Component({})
export default class FillInText extends FillInBase {
  @Prop({
    required: true,
  })
  private text: string;
}
</script>

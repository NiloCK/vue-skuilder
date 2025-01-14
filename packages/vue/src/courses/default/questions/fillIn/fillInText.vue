<template>
  <span class="headline">{{ text }}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class FillInText extends Vue {
  @Prop({
    required: true,
  })
  private text: string;
}
</script>

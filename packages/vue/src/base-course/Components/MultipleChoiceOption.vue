<template>
  <v-card v-bind:class="`${className}`" v-on:mouseover="select" v-on:click="submitThisOption">
    <MarkdownRenderer v-bind:md="content" />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    MarkdownRenderer: () => import('@/base-course/Components/MarkdownRenderer.vue'),
  },
})
export default class MultipleChoiceOption extends Vue {
  @Prop() public content: string;
  @Prop() public selected: boolean;
  @Prop() public number: number;
  @Prop() public setSelection: (selection: number) => void;
  @Prop() public submit: () => void;
  @Prop() public markedWrong: boolean;

  public select(): void {
    this.setSelection(this.number);
  }

  public submitThisOption(): void {
    if (this.markedWrong) {
      return;
    } else {
      this.select();
      this.submit();
    }
  }

  get className(): string {
    let color: string;

    switch (this.number) {
      case 0:
        color = 'red';
        break;
      case 1:
        color = 'purple';
        break;
      case 2:
        color = 'indigo';
        break;
      case 3:
        color = 'light-blue';
        break;
      case 4:
        color = 'teal';
        break;
      case 5:
        color = 'deep-orange';
        break;
      default:
        color = 'grey';
        break;
    }

    if (this.selected && !this.markedWrong) {
      // return `choice selected ${color} darken-4 white--text elevation-8`;
      return `choice selected ${color} lighten-3 elevation-8`;
    } else if (!this.selected && !this.markedWrong) {
      return `choice not-selected ${color} lighten-4 elevation-1`;
    } else if (this.selected && this.markedWrong) {
      return `choice selected grey lighten-2 elevation-8`;
    } else if (!this.selected && this.markedWrong) {
      return 'choice not-selected grey lighten-2 elevation-0';
    } else {
      throw new Error(`'selected' and 'markedWrong' props in MultipleChoiceOption are in an impossible configuration.`);
    }
  }
}
</script>

<style scoped>
.choice {
  text-align: center;
  display: inline-block;
  border-radius: 4px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
  margin: 10px;
  min-width: 75px; /* prevent tiny click-btns on, eg, one-letter answers */
}

.selected {
  transform: translateY(-10px) /* rotate(3deg) */ scale(1.15);
  z-index: 1;
}

.not-selected {
  z-index: 0;
}
</style>

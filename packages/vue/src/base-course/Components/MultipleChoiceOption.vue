<template>
  <div :class="`${className} headline`" @mouseover="select" @click="submitThisOption">
    {{ content }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
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
    if (this.selected && !this.markedWrong) {
      return 'choice selected';
    } else if (!this.selected && !this.markedWrong) {
      return 'choice';
    } else if (this.selected && this.markedWrong) {
      return 'choice selected wrong';
    } else if (!this.selected && this.markedWrong) {
      return 'choice wrong';
    } else {
      throw new Error(`'selected' and 'markedWrong' props in MultipleChoiceOption are in an impossible configuration.`);
    }
  }
}
</script>

<style scoped>
.choice {
  display: inline-block;
  border-radius: 4px;
  padding: 10px;
  margin: 8px;
}

.selected {
  transition: all ease-out 0.15s;
  box-shadow: 2px 3px 4px 2px;
  transform: translateY(-10px) /* rotate(3deg) */ scale(1.15);
}

.wrong {
  background-color: gray !important;
}

.choice:nth-child(1) {
  background-color: lightgreen;
  outline-width: 5px;
}
.choice:nth-child(2) {
  /* section for 'selected' element */
  /* transform: rotate(45); */

  /* end section */
  background-color: lightcoral;
}
.choice:nth-child(3) {
  background-color: lightskyblue;
}
.choice:nth-child(4) {
  background-color: peachpuff;
}
.choice:nth-child(5) {
  background-color: yellowgreen;
}
.choice:nth-child(6) {
  background-color: lightsalmon;
}
</style>

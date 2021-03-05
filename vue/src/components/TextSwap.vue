<template>
  <transition appear name="fade" mode="out-in">
    <a @click="next()" v-for="(t, i) in text" v-if="i === index" :key="i">{{ text[index] }}</a>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class TextSwap extends Vue {
  @Prop({
    type: Array,
    required: true,
  })
  private text: string[];
  private index: number = 0;

  public next() {
    if (this.text.length > 1) {
      const previous = this.index;
      // this.index = -1; // triggering animation
      // this.index = previous;
      while (this.index === previous) {
        this.index = Math.floor(Math.random() * this.text.length);
      }
    }
  }
}
</script>

<style scoped>
a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #aaa;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
  text-underline-position: below;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

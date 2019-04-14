<template>
    <v-btn @click="play" large raised icon color="primary">
        <v-icon>play_arrow</v-icon>
    </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';
import * as mousetrap from 'mousetrap';
import { log } from 'util';
import { setTimeout } from 'timers';

@Component({})
export default class AudioAutoPlayer extends Vue {
  @Prop({
    required: true
  }) public src: string | string[];
  public audioElems: HTMLAudioElement[] = [];

  public created() {
    if (typeof this.src === 'string') {
      this.audioElems.push(new Audio(this.src));
    } else {
      this.src.forEach((url) => {
        this.audioElems.push(new Audio(url));
      });
    }

    mousetrap.bind('up', () => {
      this.play();
    });
  }

  private play() {
    this.playByIndex(0);
  }
  private playByIndex(n: number) {
    this.audioElems[n].play();

    if (n + 1 < this.audioElems.length) {
      const delay = (this.audioElems[n].duration + 0.7) * 1000;
      setTimeout(() => {
        this.playByIndex(n + 1);
      }, delay);
    }
  }
}
</script>

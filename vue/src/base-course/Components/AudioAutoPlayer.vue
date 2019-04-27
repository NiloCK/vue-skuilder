<template>
    <v-btn @click="play" large raised icon color="primary">
        <v-icon>volume_up</v-icon>
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
  private playTimeouts: NodeJS.Timer[] = [];
  private playing: boolean = false;

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

    // setTimeout here because calling this.play() directly
    // plays the entire array of audioElems simultaneously.
    // No idea why ... ?
    setTimeout(this.play, 100);
  }

  public stop() {
    this.playing = false;

    this.playTimeouts.forEach((timeOut) => {
      clearTimeout(timeOut);
    });

    log(`Audio stopping...`);
    this.audioElems.forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  private play() {
    this.playing = true;
    this.playByIndex(0);
  }

  private playByIndex(n: number) {
    this.audioElems[n].play();

    if (n + 1 < this.audioElems.length) {
      const delay = (this.audioElems[n].duration + 0.7) * 1000;
      this.playTimeouts.push(setTimeout(() => {
        if (this.playing) {
          this.playByIndex(n + 1);
        }
      }, delay));
    }
  }

  private beforeDestroy() {
    this.stop();
  }



}
</script>

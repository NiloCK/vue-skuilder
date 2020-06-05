<template>
    <v-btn @click="play" large raised icon color="primary">
        <v-icon>volume_up</v-icon>
    </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';
import { log } from 'util';
import { setTimeout } from 'timers';
import SkldrMouseTrap from '../../SkldrMouseTrap';

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

    SkldrMouseTrap.bind([{
      hotkey: 'up',
      callback: this.play,
      command: 'Replay Audio'
    }]);

    this.play();
  }

  private stop() {
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

  private downloadFinished(i: number): boolean {
    try {
      return !isNaN(this.audioElems[i].duration);
    } catch (e) {
      throw new Error('AudioPlayer does not have an element at this index');
    }
  }

  private play() {
    this.playing = true;
    this.playByIndex(0);
  }

  private playByIndex(n: number) {
    if (this.downloadFinished(n)) {

      this.audioElems[n].play();

      if (n + 1 < this.audioElems.length) {
        const delay = (this.audioElems[n].duration + 0.7) * 1000;
        this.playTimeouts.push(setTimeout(() => {
          if (this.playing) {
            this.playByIndex(n + 1);
          }
        }, delay));
      }
    } else {
      setTimeout(this.playByIndex, 100, n);
    }
  }

  private beforeDestroy() {
    SkldrMouseTrap.reset();
    this.stop();
  }

}
</script>

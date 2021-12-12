<template>
  <v-btn v-on:click="play" large raised icon v-bind:class="playing ? 'primary lighten-3 playing' : 'primary'">
    <v-icon>volume_up</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { setTimeout } from 'timers';
import { log } from 'util';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import SkldrMouseTrap from '../../SkldrMouseTrap';

@Component({})
export default class AudioAutoPlayer extends Vue {
  private static LOCK: AudioAutoPlayer | null = null;
  private static playbackGap: number = 500;

  @Prop({
    required: true,
  })
  public src: string | string[];
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

    SkldrMouseTrap.bind([
      {
        hotkey: 'up',
        callback: this.play,
        command: 'Replay Audio',
      },
    ]);

    this.play();
  }

  private stop() {
    this.playing = false;
    setTimeout(() => {
      AudioAutoPlayer.LOCK == null;
    }, AudioAutoPlayer.playbackGap);

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
    if (AudioAutoPlayer.LOCK === null || AudioAutoPlayer.LOCK === this) {
      AudioAutoPlayer.LOCK = this;
      this.playing = true;
      this.playByIndex(0);
    } else {
      // lock held by another card - check again in _x_ ms
      setTimeout(this.play, 100);
    }
  }

  private playByIndex(n: number) {
    if (this.downloadFinished(n)) {
      this.audioElems[n].play();

      if (n + 1 < this.audioElems.length) {
        const delay = (this.audioElems[n].duration + 0.7) * 1000;
        this.playTimeouts.push(
          setTimeout(() => {
            if (this.playing) {
              this.playByIndex(n + 1);
            }
          }, delay)
        );
      } else {
        setTimeout(() => {
          this.playing = false;
        }, this.audioElems[n].duration * 1000);
        setTimeout(() => {
          // release the AudioAutoPlayer lock - let other elements run
          AudioAutoPlayer.LOCK = null;
        }, this.audioElems[n].duration * 1000 + AudioAutoPlayer.playbackGap);
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

<style scoped>
.playing {
  /* transform: rotate(3deg) scale(1.15); */
  animation: 0.85s ease-in-out infinite alternate pulse;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.15);
  }
}
</style>

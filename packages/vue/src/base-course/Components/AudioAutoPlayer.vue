<template>
  <v-btn
    @click="play"
    large
    icon
    v-bind:color="playing ? 'primary lighten-3' : 'primary'"
    :class="{ playing: playing }"
  >
    <v-icon>mdi-volume-high</v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import SkldrMouseTrap from '../../SkldrMouseTrap';

interface AudioAutoPlayerData {
  audioElems: HTMLAudioElement[];
  playTimeouts: NodeJS.Timer[];
  playing: boolean;
}

interface AudioAutoPlayerProps {
  src: string | string[];
}

interface AudioAutoPlayerMethods {
  stop(): void;
  downloadFinished(i: number): boolean;
  play(): void;
  playByIndex(n: number): void;
}

let staticLOCK: Vue | null = null;
const playbackGap = 500;

const AudioAutoPlayer = Vue.extend<AudioAutoPlayerData, AudioAutoPlayerMethods, {}, AudioAutoPlayerProps>({
  name: 'AudioAutoPlayer',
  props: {
    src: {
      type: [String, Array] as PropType<string | string[]>,
      required: true,
    },
  },
  data(): AudioAutoPlayerData {
    return {
      audioElems: [],
      playTimeouts: [],
      playing: false,
    };
  },
  beforeCreate() {
    staticLOCK = null;
  },
  created() {
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
  },
  methods: {
    stop() {
      this.playing = false;
      setTimeout(() => {
        staticLOCK = null;
      }, playbackGap);

      this.playTimeouts.forEach((timeOut) => {
        clearTimeout(timeOut);
      });

      console.log(`Audio stopping...`);
      this.audioElems.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    },
    downloadFinished(i: number): boolean {
      try {
        return !isNaN(this.audioElems[i].duration);
      } catch (e) {
        throw new Error('AudioPlayer does not have an element at this index');
      }
    },
    play() {
      if (staticLOCK === null || staticLOCK === this) {
        staticLOCK = this;
        this.playing = true;
        this.playByIndex(0);
      } else {
        // lock held by another card - check again in _x_ ms
        setTimeout(this.play, 100);
      }
    },
    playByIndex(n: number) {
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
            staticLOCK = null;
          }, this.audioElems[n].duration * 1000 + playbackGap);
        }
      } else {
        setTimeout(this.playByIndex, 100, n);
      }
    },
  },
  beforeDestroy() {
    SkldrMouseTrap.reset();
    this.stop();
  },
});

export default AudioAutoPlayer;
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

<template>
    <button @click="play">
        Play
    </button>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

@Component({})
export default class AudioAutoPlayer extends Vue {
    @Prop({
        required: true
    }) public src: string;
    public audioPlayer: HTMLAudioElement;

    public created() {
        this.audioPlayer = new Audio(this.src);
        this.audioPlayer.autoplay = true;
    }

    private play() {
        this.audioPlayer.play();
    }
}
</script>


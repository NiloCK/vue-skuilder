<template>
    <v-btn @click="play" large raised icon color="primary">
        <v-icon>play_arrow</v-icon>
    </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';
import * as mousetrap from 'mousetrap';

@Component({})
export default class AudioAutoPlayer extends Vue {
    @Prop({
        required: true
    }) public src: string;
    public audioPlayer: HTMLAudioElement;

    public created() {
        this.audioPlayer = new Audio(this.src);
        this.audioPlayer.autoplay = true;

        mousetrap.bind('up', () => {
            this.play();
        });
    }

    private play() {
        this.audioPlayer.play();
    }
}
</script>


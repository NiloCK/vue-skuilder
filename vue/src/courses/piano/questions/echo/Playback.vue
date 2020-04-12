<template>
  <div>
    <div class="headline">
      Listen and repeat.The first note is: <span>{{firstNote}}</span>
    </div>
    <div>
      <v-progress-linear :value="playbackProgress"></v-progress-linear>
    </div>
    <v-btn
      color="primary"
      @click="reset"
      autofocus
    >
      Play again <v-icon right>volume_up</v-icon>
    </v-btn>

    <div>

      <span class='display-1 hidden'>&#8226;</span>
      <span v-if='initialized'>
        <span class="hidden">

        {{inputNotes.length}}
        </span>
        <span
          class='display-1'
          v-for='n in midi.recording.filter(n => n.type === "noteon").length'
          :key='n'>&#8226;
        </span>
      </span>
      <span class='display-1 hidden'>&#8226;</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import SkMidi, { NoteEvent } from '../../utility/midi';
import { EchoQuestion } from '.';
import moment from 'moment';

@Component({
  components: {}
})
export default class Playback extends QuestionView<EchoQuestion> {
  public ready: boolean = false;
  public midi: SkMidi;
  public initialized: boolean = false;
  public playbackInitTime: number;

  public playbackProgress: number = 0;
  public get firstNote(): string {
    if (this.initialized) {
      return this.question.midi[0].note.name + this.question.midi[0].note.octave;
    } else {
      return `... I don't know - something is wrong!`;
    }
  }
  public inputNotes: any[] = [];
  // ublic get inputNotes(): any[] {
  //   return this.midi.recording.filter(e => e.type === 'noteon');
  // }

  async created() {
    this.MouseTrap = new Mousetrap(this.$el);
    this.midi = await SkMidi.instance();
    this.midi.record();
    this.play();
    this.ready = true;
    setTimeout(this.timer, 200);

    this.MouseTrap.bind('space', () => { this.reset() });
    this.initialized = true;
  }

  public reset() {
    console.log(`Playback::Reset() called`);
    this.midi.record();
    this.play();
  }

  public timer() {
    this.inputNotes = this.midi.recording.filter(n => n.type === 'noteon');
    const length = this.question.midi.length - this.midi.recording.length;
    let done;
    if (length <= 0) {
      done = this.submit();
    }

    if (!done) setTimeout(this.timer, 200);
  }

  public play() {
    const duration = this.question.midi.reduce((max, current) => {
      if (current.timestamp > max.timestamp) {
        return current;
      } else {
        return max;
      }
    }).timestamp;

    this.midi.play(this.question.midi);
    setTimeout(() => {
      console.log('done playback...');
    }, duration);
  }

  get question() {
    return new EchoQuestion(this.data);
  }

  public submit() {
    // this.question.isCorrect(this.midi.recording);
    if (!this.submitAnswer(this.midi.recording).isCorrect) {
      this.midi.record();
      return false;
    } else {
      return true;
    }
  }
}
</script>

<style lang="css" scoped>
.hidden {
  opacity: 0;
}
</style>
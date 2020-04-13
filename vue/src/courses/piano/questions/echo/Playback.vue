<template>
  <div>
    <div class="display-1">First note: <span class='font-weight-bold'>{{firstNote}}</span></div>
    <div class="headline">
      Listen...<span v-if="recording"> and Repeat</span>
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
        <span
          class='display-1'
          v-for='n in notesOn'
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
  public midi: SkMidi;
  public initialized: boolean = false;
  public playbackInitTime: number;
  public recording: boolean = false;

  private intervalID: number;

  public playbackProgress: number = 0;
  public playbackStartTime: moment.Moment = moment.utc();
  public playbackDuration: number;

  public get firstNote(): string {
    if (this.initialized) {
      return this.question.midi[0].note.name;
    } else {
      return `... I don't know - something is wrong!`;
    }
  }
  public notesOn: number = 0;
  public notesOff: number = 0;

  async created() {
    this.MouseTrap = new Mousetrap(this.$el);
    this.midi = await SkMidi.instance();
    this.playbackDuration = this.question.duration;
    this.play();

    this.MouseTrap.unbind('space'); // remove from dismissed cards
    this.MouseTrap.bind('space', () => { this.play() });
    this.initialized = true;
  }

  public record() {
    this.midi.record();
    this.recording = true;

    // attach listeners
    this.midi.addNoteonListenter((e) => {
      this.notesOn++;
      if (this.notesOn + this.notesOff >= this.question.midi.length) {
        this.submit();
      }
    });
    this.midi.addNoteoffListenter((e) => {
      this.notesOff++;
      if (this.notesOn + this.notesOff >= this.question.midi.length) {
        this.submit();
      }
    });
  }

  public setPlaybackProgress() {
    const msSinceStart: number = Math.abs(
      moment.utc().diff(this.playbackStartTime, 'milliseconds')
    );
    this.playbackProgress = (msSinceStart / this.playbackDuration) * 100;
    // if (this.playbackProgress < 100) {
    //   requestAnimationFrame(this.setPlaybackProgress);
    // }
  }

  public play() {
    this.midi.stopRecording();
    this.midi.eraseRecording();
    this.playbackStartTime = moment.utc();
    this.notesOn = 0;
    this.notesOff = 0;
    this.recording = false;
    this.playbackProgress = 0;

    // this.intervalID = window.setInterval(() => {
    //   this.setPlaybackProgress();
    //   if (this.playbackProgress >= 100) {
    //     window.clearInterval(this.intervalID);
    //   }
    // }, 150);
    // requestAnimationFrame(this.setPlaybackProgress);

    this.midi.play(this.question.midi);
    setTimeout(() => {
      console.log('done playback...');
      this.record();
    }, this.playbackDuration);
  }

  get question() {
    return new EchoQuestion(this.data);
  }

  public submit() {
    // this.question.isCorrect(this.midi.recording);
    if (!this.submitAnswer(this.midi.recording).isCorrect) {
      this.play();
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
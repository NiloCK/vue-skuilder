<template>
  <div>
    <div class="display-1">First note: <span class='font-weight-bold'>{{firstNote}}</span></div>
    <div class="headline">
      Listen...<span v-if="recording"> and Repeat</span>
    </div>
    <!-- <div id="progressBar">
      <v-progress-linear :value="100"></v-progress-linear>
    </div> -->
    <div class="progressContainer">
      <div id="progress" ref="progressBar"></div> 
    </div>
      
    <v-btn
      color="primary"
      @click="clearAttempt"
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
  public attempts: number = 0;

  public get firstNote(): string {
    if (this.initialized) {
      return this.question.midi[0].note.name;
    } else {
      return `... I don't know - something is wrong!`;
    }
  }
  public notesOn: number = 0;
  public notesOff: number = 0;

  public $refs: {
    progressBar: HTMLDivElement;
  }

  async created() {
    // this.MouseTrap = new Mousetrap(this.$el);
    this.midi = await SkMidi.instance();
    this.MouseTrap.unbind('space'); // remove from dismissed cards
    this.MouseTrap.bind('space', () => { this.clearAttempt() });
  }

  public clearAttempt() {
    if (this.notesOn > 0) {
      this.submit();
    } else {
      this.play();
    }
  }

  public async mounted() {
    await SkMidi.instance();
    this.playbackDuration = this.question.duration;
    this.play();

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

  public play() {
    this.midi.stopRecording();
    this.midi.eraseRecording();
    this.playbackStartTime = moment.utc();
    this.notesOn = 0;
    this.notesOff = 0;
    this.recording = false;
    this.playbackProgress = 0;

    this.runProgressBar();

    this.midi.play(this.question.midi);

    // start listening for input after last note is played
    setTimeout(() => {
      console.log('done playback...');
      this.record();
    }, this.question.lastNoteOnTimestamp);
  }

  private runProgressBar() {
    // console.log('running progress bar...');
    this.$refs.progressBar.style.animationName = '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.$refs.progressBar.style.animationDuration = this.playbackDuration + 'ms';
        this.$refs.progressBar.style.animationName = 'progress';
      })
    })
  }

  get question() {
    return new EchoQuestion(this.data);
  }

  public submit() {
    // this.question.isCorrect(this.midi.recording);
    if (!this.submitAnswer(this.midi.recording).isCorrect) {
      this.attempts++;
      if (this.attempts < this.maxAttemptsPerView) {
        this.play();
      }
      return false;
    } else {
      return true;
    }
  }
}
</script>

<style lang="css" >
@keyframes progress {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

.progressContainer {
  background-color: #eee;
  height: 5px;
}

#progress {
  background-color: blue;
  width: 100%;
  height: 5px;
  animation-timing-function: linear;
}

.hidden {
  opacity: 0;
}
</style>
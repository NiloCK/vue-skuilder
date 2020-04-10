<template>
  <div>
    <div class="headline">
      Listen and repeat:
    </div>
    <!-- <div>
      <v-progress-linear :value="playbackProgress"></v-progress-linear>
    </div> -->
    <v-btn 
      color="primary"
      @click="reset"
    >
      Play again <v-icon right>volume_up</v-icon>
    </v-btn>

    <!-- <div v-if='initialized'>
      <span class='display-1' v-for='note in inputNotes' key='note'>&#8226;</span>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import SkMidi, { NoteEvent } from '../../utility/midi';
import { EchoQuestion } from '.';

@Component({
  components: {}
})
export default class Playback extends QuestionView<EchoQuestion> {
  public ready: boolean = false;
  public midi: SkMidi;
  public initialized: boolean = false;

  public get playbackProgress(): number {
    return 25;
  }
  // public inputNotes: any[] = [];

  async created() {

    this.midi = await SkMidi.instance();
    this.midi.record();
    this.play();
    this.ready = true;
    setTimeout(this.timer, 200);

    this.MouseTrap.bind('space', this.reset);
    this.initialized = true;
  }

  public reset() {
    this.midi.record();
    this.play();
  }

  public timer() {
    // this.inputNotes .midi.recording.filter(n => n.type === 'noteon');
    const length = this.question.midi.length - this.midi.recording.length;
    let done;
    if (length <= 0) {
      done = this.submit();
    }

    if (!done) setTimeout(this.timer, 200);
  }

  public play() {
    this.midi.play(this.question.midi);
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

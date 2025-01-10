<template>
  <div v-if="initialized">
    <!-- <div v-if="state === 'ready'"> -->
    <div v-if="true">
      <!-- <div class="display-1">{{promptText}} <span class='font-weight-bold'>{{firstNote}}</span></div> -->
      <div class="display-1">{{ promptText }} <note-display :chroma="firstNoteChroma" /></div>
      <div class="headline">Listen...<span v-if="recording"> and Repeat</span></div>
      <!-- <div id="progressBar">
      <v-progress-linear :value="100"></v-progress-linear>
    </div> -->
      <div class="progressContainer">
        <div id="progress" ref="progressBar"></div>
      </div>

      <v-btn color="primary" @click="clearAttempt" autofocus> Play again <v-icon right>volume_up</v-icon> </v-btn>

      <syllable-seq-vis ref="inputVis" v-if="true" :seq="inputSeq" :lastTSsuggestion="lastTSsuggestion" />
      <syllable-seq-vis v-if="graded" :seq="gradedSeq" />
    </div>
    <div v-else-if="state === 'nodevice'">No midi device detected. Please attach one!</div>
    <div v-else-if="state === 'notsupported'">
      <p>This exercise requires a midi input device, which is not supported by this browser ☹</p>
      <div>
        <p>Please try again with one of the following browsers:</p>
        <ul>
          <li>
            <a href="https://www.google.com/chrome/">Google Chrome</a>
          </li>
          <li>
            <a href="https://www.microsoft.com/edge">Microsoft Edge</a>
          </li>
          <li>
            <a href="https://brave.com/">Brave</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import SkMidi, { NoteEvent, eventsToSyllableSequence, SyllableSequence } from '../../utility/midi';
import { EchoQuestion } from '.';
import moment from 'moment';
import SyllableSeqVis from '../../utility/SyllableSeqVis.vue';
import NoteDisplay from '../../NoteDisplay.vue';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';

@Component({
  components: {
    SyllableSeqVis,
    NoteDisplay,
  },
})
export default class Playback extends QuestionView<EchoQuestion> {
  public midi: SkMidi;
  public initialized: boolean = false;
  public state: string = 'notSet';
  public playbackInitTime: number;
  public recording: boolean = false;

  private intervalID: number;

  public playbackProgress: number = 0;
  public playbackStartTime: moment.Moment = moment.utc();
  public playbackDuration: number;
  public attempts: number = 0;

  public gradedSeq: SyllableSequence = eventsToSyllableSequence([]);
  public graded: boolean = false;

  public inputSeq: SyllableSequence = eventsToSyllableSequence([]);
  public lastTSsuggestion: number = 0;

  public errMsg: string = '';

  public get promptText(): string {
    if (eventsToSyllableSequence(this.question.midi).syllables[0].notes.length > 1) {
      return 'Lowest note of first chord:';
    } else {
      return 'First note:';
    }
  }

  public get firstNoteChroma(): number {
    if (this.initialized) {
      // return this.question.midi[0].note.name;
      return eventsToSyllableSequence(this.question.midi).rootNote.number % 12;
    } else {
      return 0;
    }
  }

  public get firstNote(): string {
    if (this.initialized) {
      // return this.question.midi[0].note.name;
      return eventsToSyllableSequence(this.question.midi).rootNote.name;
    } else {
      return `... I don't know! ${this.errMsg}`;
    }
  }
  public notesOn: number = 0;
  public notesOff: number = 0;

  public $refs: {
    progressBar: HTMLDivElement;
    inputVis: SyllableSeqVis;
  };

  async created() {
    // this.MouseTrap = new Mousetrap(this.$el);
    this.lastTSsuggestion = this.question.midi[this.question.midi.length - 1].timestamp;
    this.MouseTrap.unbind('space'); // remove from dismissed cards
    this.MouseTrap.bind('space', () => {
      this.clearAttempt();
    });
  }

  public clearAttempt() {
    if (this.notesOn > 0) {
      this.submit();
    } else {
      this.play();
    }
  }

  public async mounted() {
    try {
      this.midi = await SkMidi.instance();
      this.midi.setStateChangeListener(() => {
        this.init();
      });
      this.initialized = true;
    } catch (error) {
      alertUser({
        status: Status.error,
        text: 'Midi device not supported',
      });
      this.errMsg = JSON.stringify(error);
      this.state = 'notsupported';
      this.initialized = true;
    }

    this.init();
  }

  public init() {
    if (this.state) {
      if (this.state !== this.midi.state) {
        this.initialized = false;
        this.state = this.midi.state;
        this.initialized = true;
      }
    } else {
      this.state = this.midi.state;
      this.initialized = true;
    }

    console.log(`Playback is running init with state: ${this.state}`);

    if (this.state === 'ready') {
      this.playbackDuration = this.question.duration;
      this.play();
    }
  }

  public record() {
    this.midi.record();
    this.recording = true;

    // attach listeners
    this.midi.addNoteonListenter((e) => {
      this.notesOn++;
      this.inputSeq.append(e);
      this.$refs.inputVis.updateBounds();
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
    try {
      this.$refs.progressBar.style.animationName = '';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.$refs.progressBar.style.animationDuration = this.playbackDuration + 'ms';
          this.$refs.progressBar.style.animationName = 'progress';
        });
      });
    } catch (e) {
      setTimeout(this.runProgressBar, 50);
    }
  }

  get question() {
    return new EchoQuestion(this.data);
  }

  public submit() {
    const qSylSeq = eventsToSyllableSequence(this.question.midi);
    const aSylSeq = eventsToSyllableSequence(this.midi.recording);
    this.gradedSeq = qSylSeq.grade(aSylSeq);
    this.inputSeq = eventsToSyllableSequence([]);

    // console.log("Graded Sequence:\n" + this.gradedSeq.toString());
    console.log('Graded Sequence is correct: ' + this.gradedSeq.isCorrect());

    if (!this.submitAnswer(this.midi.recording).isCorrect) {
      this.attempts++;
      this.graded = true;
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

<style lang="css">
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

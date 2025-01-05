<template>
  <div>
    <div v-if="recording">
      <span class="headline">
        Now Recording from device:
        <span class="font-weight-black">{{ midi.configuredInput }}</span>
      </span>
    </div>
    <syllable-seq-vis ref="inputVis" v-if="true" :seq="SylSeq" lastTSsuggestion="5000" />
    <v-btn color="primary" @click="play" :disabled="hasRecording()">
      Preview
      <v-icon right>volume_up</v-icon>
    </v-btn>
    <v-btn color="error" @click="reset" :disabled="hasRecording()">
      Clear and try again
      <v-icon right>close</v-icon>
    </v-btn>
    <v-checkbox @click.capture="reset" label="Include Transpositions" v-model="transpositions"></v-checkbox>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';
import SkMidi, {
  eventsToSyllableSequence,
  SyllableSequence,
  transposeSyllableSeq,
} from '../../../../courses/piano/utility/midi';
import SyllableSeqVis from '../../../../courses/piano/utility/SyllableSeqVis.vue';

@Component({
  components: {
    SyllableSeqVis,
  },
})
export default class MidiInput extends FieldInput {
  public midi: SkMidi;
  public recording: boolean = false;
  public SylSeq: SyllableSequence = eventsToSyllableSequence([]);
  public display: boolean = false;
  public transpositions: boolean = false;

  public declare $refs: {
    inputVis: SyllableSeqVis;
    inputField: HTMLInputElement;
  };

  async created() {
    try {
      this.midi = await SkMidi.instance();
      this.record();

      // this.store[this.field.name] = this.midi.recording;
      this.store[this.field.name] = this.getTransposedSeqs;
    } catch (e) {
      throw e;
    }
  }

  public record() {
    this.midi.record();
    this.midi.addNoteonListenter((e) => {
      this.SylSeq.append(e);
      this.$refs.inputVis.updateBounds();
    });
    this.recording = true;
  }

  public getTransposedSeqs() {
    if (this.transpositions) {
      return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((shift) => {
        return transposeSyllableSeq(this.midi.recording, shift);
      });
    } else {
      return [this.midi.recording];
    }
  }

  public clearData() {
    console.log('midiInput clearing data...');
    this.midi.stopRecording();
    this.midi.eraseRecording();
    this.SylSeq = eventsToSyllableSequence([]);
    this.record();
    this.recording = true;

    this.store.convertedInput[this.field.name] = this.midi.recording;
    this.store.validation[this.field.name] = false;

    // this.store[this.field.name] = this.midi.recording;
    this.store[this.field.name] = this.getTransposedSeqs;
  }

  public hasRecording(): boolean {
    // return this.midi.hasRecording;
    if (this.midi) {
      if (this.midi.hasRecording) {
        return this.midi.hasRecording;
      }
    }
    return false;
  }

  public reset() {
    this.clearData();
  }

  public play() {
    this.midi.play();
    // this.SylSeq = eventsToSyllableSequence(this.midi.recording);
    this.display = true;
    // console.log(eventsToSyllableSequence(this.midi.recording).toString());
    this.validate();
  }
}
</script>

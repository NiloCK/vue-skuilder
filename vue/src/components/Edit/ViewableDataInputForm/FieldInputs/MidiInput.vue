<template>
  <div>
    <div v-if="recording">
      <span class="headline">
        Now Recording from device:
        <span class="font-weight-black">{{midi.configuredInput}}</span>
      </span>
    </div>
    <v-btn color="primary" @click="play" :disabled="hasRecording()">
      Preview
      <v-icon right>volume_up</v-icon>
    </v-btn>
    <v-btn color="error" @click="reset" :disabled="hasRecording()">
      Clear and try again
      <v-icon right>close</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { FieldInput } from "../FieldInput";
import SkMidi from "../../../../courses/piano/utility/midi";

@Component({})
export default class MidiInput extends FieldInput {
  public midi: SkMidi;
  public recording: boolean = false;

  async created() {
    this.midi = await SkMidi.instance();
    try {
      this.midi.record();
      this.recording = true;

      this.store[this.field.name] = this.midi.recording;
    } catch (e) {
      throw e;
    }
  }

  public clearData() {
    console.log('midiInput clearing data...');
    this.midi.stopRecording();
    this.midi.eraseRecording();
    this.midi.record();
    this.recording = true;

    this.store.convertedInput[this.field.name] = this.midi.recording;
    this.store.validation[this.field.name] = false;

    this.store[this.field.name] = this.midi.recording;
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
    this.midi.record();
  }

  public play() {
    this.midi.play();
    this.validate();
  }
}
</script>
 
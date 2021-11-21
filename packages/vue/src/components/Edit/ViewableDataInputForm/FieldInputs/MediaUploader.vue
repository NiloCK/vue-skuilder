<template>
  <div>
    <label class="headline">Add media:</label>
    <v-spacer></v-spacer>

    <v-btn round color="primary">
      <v-icon left>image</v-icon>
      Image
    </v-btn>
    <v-btn round color="primary" v-on:click="newAudio">
      <v-icon left>mic</v-icon>
      Audio
    </v-btn>

    <audio-input
      v-bind:uiValidationFunction="uiValidationFunction"
      v-for="(a, i) in audio"
      v-bind:key="i"
      v-bind:field="a.fieldDef"
      v-bind:store="store"
    ></audio-input>
  </div>
</template>

<script lang="ts">
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { Component } from 'vue-property-decorator';
import WaveSurfer from 'wavesurfer.js';
import { FieldInput } from '../FieldInput';
import AudioInput from './AudioInput.vue';
var MediaStreamRecorder = require('msr');

type AudioData = {
  data: Blob;
  fieldDef: FieldDefinition;
};

@Component({
  components: {
    AudioInput,
  },
})
export default class MediaUploadInput extends FieldInput {
  public get title(): string {
    return this.field.name;
  }
  public clearData() {
    this.audio = [];
    this.image = [];
  }

  public audio: AudioData[] = [];
  public image: Blob[] = [];

  private mediaRecorder: any;
  private wavesurfer: WaveSurfer;

  newAudio() {
    const name = `audio-${this.audio.length + 1}`;
    this.store[name] = {};
    this.audio.push({
      data: new Blob(),
      fieldDef: {
        name,
        type: FieldType.AUDIO,
      },
    });
    this.field;
  }
  public getValidators(): ValidatingFunction[] {
    return [
      () => {
        return {
          status: Status.ok,
          msg: '',
        };
      },
    ];
  }
}
</script>

<style scoped>
@import './FieldInput.css';

input[type='file'] {
  display: none;
}
</style>

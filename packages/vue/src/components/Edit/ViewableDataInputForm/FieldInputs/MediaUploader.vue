<template>
  <div>
    <label class="headline">Add media:</label>
    <v-spacer></v-spacer>

    <v-btn round color="primary" v-on:click="newImage">
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
      :autofocus="false"
      v-bind:key="'audio'+i"
      v-bind:field="a.fieldDef"
      v-bind:store="store"
    ></audio-input>

    <image-input
      v-bind:uiValidationFunction="uiValidationFunction"
      v-for="(img, i) in image"
      :autofocus="false"
      v-bind:key="'image'+i"
      v-bind:field="img.fieldDef"
      v-bind:store="store"
    ></image-input>
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
import ImageInput from './ImageInput.vue';
var MediaStreamRecorder = require('msr');

type MediaData = {
  data: Blob;
  fieldDef: FieldDefinition;
};

@Component({
  components: {
    AudioInput,
    ImageInput,
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

  public audio: MediaData[] = [];
  public image: MediaData[] = [];

  private mediaRecorder: any;
  private wavesurfer: WaveSurfer;

  newImage() {
    const name = `image-${this.image.length + 1}`;
    this.store[name] = {};
    this.image.push({
      data: new Blob(),
      fieldDef: {
        name,
        type: FieldType.IMAGE,
      },
    });
  }

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

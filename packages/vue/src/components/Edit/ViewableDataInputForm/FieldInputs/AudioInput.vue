<template>
  <div>
    <label class="headline" v-bind:for="field.name">{{ title }}: </label>

    <div>
      <v-btn-toggle mandatory multiple elevation-5>
        <v-btn flat>
          <v-icon v-bind:color="recording ? 'red' : null" v-on:click="record">mic</v-icon>
        </v-btn>
        <v-btn flat>
          <v-icon v-on:click="stop">stop</v-icon>
        </v-btn>
        <v-btn flat>
          <v-icon v-on:click="play">play_arrow</v-icon>
        </v-btn>

        <v-btn flat
          ><label>
            <input
              ref="inputField"
              v-bind:id="blobInputID"
              v-bind:name="field.name"
              v-on:change="processInput"
              type="file"
              v-bind:class="validationStatus.status"
            />
            <span>Upload</span><v-icon>folder</v-icon>
          </label>
        </v-btn>
      </v-btn-toggle>
      <div v-bind:id="waveSurferId"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { Component } from 'vue-property-decorator';
import WaveSurfer from 'wavesurfer.js';
import { FieldInput } from '../FieldInput';
var MediaStreamRecorder = require('msr');

@Component
export default class AudioInput extends FieldInput {
  public get title(): string {
    return this.field.name;
  }
  public getValidators(): ValidatingFunction[] {
    if (this.field.validator) {
      return [this.field.validator.test];
    } else {
      return [];
    }
  }
  private get blobInputID(): string {
    return 'blobInput' + this.field.name;
  }
  private get waveSurferId(): string {
    return `ws-${this.field.name}`;
  }
  private get blobInputElement(): HTMLInputElement {
    return document.getElementById(this.blobInputID) as HTMLInputElement;
  }
  private async processInput() {
    if (this.blobInputElement.files) {
      const file = this.blobInputElement.files[0];
      console.log(`
Processing input file:
Filename: ${file.name}
File size: ${file.size}
File type: ${file.type}
`);
      this.setData({
        content_type: file.type,
        data: file.slice(),
      } as PouchDB.Core.FullAttachment);
      this.validate();
    }
  }

  private recording: boolean = false;
  private blob: Blob;
  private blobURL: string = 'f';
  private mediaRecorder: any;
  private wavesurfer: WaveSurfer;

  private blobHandler(blob: Blob | null): void {
    if (blob === null) {
      alert('nullBlob');
    } else {
      (this as any).store[this.field.name] = {
        content_type: 'image/png',
        data: blob,
      };
      this.validate();
    }
  }

  private play() {
    console.log(this.blobURL);
    this.wavesurfer.playPause();
  }

  private stop() {
    this.mediaRecorder.stop();
    this.recording = false;

    setTimeout(() => {
      this.setData({
        content_type: 'audio',
        data: this.blob,
      } as PouchDB.Core.FullAttachment);
    }, 100);
    this.validate();
  }

  public reset() {
    this.wavesurfer.destroy();
  }

  private record() {
    this.recording = true;
    this.wavesurfer = WaveSurfer.create({
      container: `#${this.waveSurferId}`,
      barWidth: 2,
      barHeight: 1, // the height of the wave
      barGap: 0, // the optional spacing between bars of the wave, if not provided will be calculated in legacy format
    });

    var mediaConstraints = {
      audio: true,
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream) => {
        console.log(`stream ${JSON.stringify(stream)} found...`);
        this.mediaRecorder = new MediaStreamRecorder(stream);
        this.mediaRecorder.mimeType = 'audio/webm'; // audio/webm or audio/ogg or audio/wav
        this.mediaRecorder.ondataavailable = (blob: any) => {
          // POST/PUT "Blob" using FormData/XHR2
          this.blob = blob;
          this.blobURL = URL.createObjectURL(blob);
          this.wavesurfer.load(this.blobURL);
        };
        this.mediaRecorder.start(0);
      })
      .catch((e) => {
        console.error('media error', e);
      });
  }
}
</script>

<style scoped>
@import './FieldInput.css';

input[type='file'] {
  display: none;
}
</style>

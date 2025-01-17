<template>
  <div>
    <label class="text-h5">Add media:</label>
    <v-spacer></v-spacer>

    <v-btn rounded color="primary" @click="newImage">
      <v-icon start>image</v-icon>
      Image
    </v-btn>
    <v-btn rounded color="primary" @click="newAudio">
      <v-icon start>mic</v-icon>
      Audio
    </v-btn>

    <audio-input
      v-for="(a, i) in audio"
      :key="'audio' + i"
      :ui-validation-function="uiValidationFunction"
      :autofocus="false"
      :field="a.fieldDef"
      :store="store"
    ></audio-input>

    <image-input
      v-for="(img, i) in image"
      :key="'image' + i"
      :ui-validation-function="uiValidationFunction"
      :autofocus="false"
      :field="img.fieldDef"
      :store="store"
    ></image-input>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import WaveSurfer from 'wavesurfer.js';
import FieldInput from '../OptionsFieldInput';
import AudioInput from './AudioInput.vue';
import ImageInput from './ImageInput.vue';

type MediaData = {
  data: Blob;
  fieldDef: FieldDefinition;
};

export default defineComponent({
  name: 'MediaUploadInput',
  components: {
    AudioInput,
    ImageInput,
  },
  extends: FieldInput,
  data() {
    return {
      audio: [] as MediaData[],
      image: [] as MediaData[],
      mediaRecorder: null as any,
      wavesurfer: null as WaveSurfer | null,
    };
  },
  computed: {
    title(): string {
      return this.field.name;
    },
  },
  methods: {
    clearData(): void {
      this.audio = [];
      this.image = [];
    },
    newImage(): void {
      const name = `image-${this.image.length + 1}`;
      this.store[name] = {};
      this.image.push({
        data: new Blob(),
        fieldDef: {
          name,
          type: FieldType.IMAGE,
        },
      });
    },
    newAudio(): void {
      const name = `audio-${this.audio.length + 1}`;
      this.store[name] = {};
      this.audio.push({
        data: new Blob(),
        fieldDef: {
          name,
          type: FieldType.AUDIO,
        },
      });
    },
    getValidators(): ValidatingFunction[] {
      return [
        () => ({
          status: Status.ok,
          msg: '',
        }),
      ];
    },
  },
});
</script>

<style scoped>
@import './FieldInput.css';

input[type='file'] {
  display: none;
}
</style>

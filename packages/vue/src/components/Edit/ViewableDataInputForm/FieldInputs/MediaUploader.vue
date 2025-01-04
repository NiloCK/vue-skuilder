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
import { defineComponent, ref } from 'vue';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import WaveSurfer from 'wavesurfer.js';
import AudioInput from './AudioInput.vue';
import ImageInput from './ImageInput.vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
var MediaStreamRecorder = require('msr');

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

  props: {
    field: {
      type: Object as () => FieldDefinition,
      required: true
    },
    store: {
      type: Object,
      required: true
    },
    uiValidationFunction: {
      type: Function as () => ValidatingFunction,
      required: true
    },
  },

  setup(props) {
    const { log, error, warn } = SkldrComposable();
    
    const audio = ref<MediaData[]>([]);
    const image = ref<MediaData[]>([]);
    const mediaRecorder = ref<any>(null);
    const wavesurfer = ref<WaveSurfer | null>(null);

    const title = computed(() => props.field.name);

    const clearData = () => {
      audio.value = [];
      image.value = [];
    };

    const newImage = () => {
      const name = `image-${image.value.length + 1}`;
      props.store[name] = {};
      image.value.push({
        data: new Blob(),
        fieldDef: {
          name,
          type: FieldType.IMAGE,
        },
      });
    };

    const newAudio = () => {
      const name = `audio-${audio.value.length + 1}`;
      props.store[name] = {};
      audio.value.push({
        data: new Blob(),
        fieldDef: {
          name,
          type: FieldType.AUDIO,
        },
      });
    };

    const getValidators = (): ValidatingFunction[] => {
      return [
        () => ({
          status: Status.ok,
          msg: '',
        }),
      ];
    };

    return {
      audio,
      image,
      mediaRecorder,
      wavesurfer,
      title,
      clearData,
      newImage,
      newAudio,
      getValidators
    };
  }
});
</script>

<style scoped>
@import './FieldInput.css';

input[type='file'] {
  display: none;
}
</style>

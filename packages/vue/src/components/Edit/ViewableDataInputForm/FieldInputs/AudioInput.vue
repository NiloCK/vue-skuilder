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
import { defineComponent, ref, computed, onBeforeUnmount } from 'vue';
import type { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import WaveSurfer from 'wavesurfer.js';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import type { FieldInputProps } from '../FieldInput';
var MediaStreamRecorder = require('msr');

export default defineComponent({
  name: 'AudioInput',
  
  props: {
    field: {
      type: Object,
      required: true
    },
    store: {
      type: Object,
      required: true
    }
  },

  emits: ['validate', 'setData'],

  setup(props, { emit }) {
    const { log, error } = SkldrComposable();
    
    const recording = ref(false);
    const blob = ref<Blob>();
    const blobURL = ref('f');
    const mediaRecorder = ref<any>(null);
    const wavesurfer = ref<WaveSurfer>();
    const inputField = ref<HTMLInputElement>();

    const title = computed(() => props.field.name);
    const blobInputID = computed(() => 'blobInput' + props.field.name);
    const waveSurferId = computed(() => `ws-${props.field.name}`);
    const blobInputElement = computed(() => 
      document.getElementById(blobInputID.value) as HTMLInputElement
    );

    const getValidators = (): ValidatingFunction[] => {
      if (props.field.validator) {
        return [props.field.validator.test];
      }
      return [];
    };

    const setData = (data: PouchDB.Core.FullAttachment) => {
      emit('setData', data);
    };

    const validate = () => {
      emit('validate');
    };

    const processInput = async () => {
      if (blobInputElement.value?.files) {
        const file = blobInputElement.value.files[0];
        log(`
Processing input file:
Filename: ${file.name}
File size: ${file.size}
File type: ${file.type}
`);
        setData({
          content_type: file.type,
          data: file.slice(),
        });
        validate();
      }
    };

    const blobHandler = (newBlob: Blob | null): void => {
      if (newBlob === null) {
        alert('nullBlob');
      } else {
        props.store[props.field.name] = {
          content_type: 'image/png',
          data: newBlob,
        };
        validate();
      }
    };

    const play = () => {
      log(blobURL.value);
      wavesurfer.value?.playPause();
    };

    const stop = () => {
      mediaRecorder.value?.stop();
      recording.value = false;

      setTimeout(() => {
        if (blob.value) {
          setData({
            content_type: 'audio',
            data: blob.value,
          });
        }
      }, 100);
      validate();
    };

    const reset = () => {
      wavesurfer.value?.destroy();
    };

    const record = () => {
      recording.value = true;
      wavesurfer.value = WaveSurfer.create({
        container: `#${waveSurferId.value}`,
        barWidth: 2,
        barHeight: 1,
        barGap: 0,
      });

      const mediaConstraints = {
        audio: true,
      };

      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then(stream => {
          log(`stream ${JSON.stringify(stream)} found...`);
          mediaRecorder.value = new MediaStreamRecorder(stream);
          mediaRecorder.value.mimeType = 'audio/webm';
          mediaRecorder.value.ondataavailable = (newBlob: Blob) => {
            blob.value = newBlob;
            blobURL.value = URL.createObjectURL(newBlob);
            wavesurfer.value?.load(blobURL.value);
          };
          mediaRecorder.value.start(0);
        })
        .catch(e => {
          error('media error', e);
        });
    };

    onBeforeUnmount(() => {
      wavesurfer.value?.destroy();
    });

    return {
      recording,
      title,
      blobInputID,
      waveSurferId,
      inputField,
      processInput,
      play,
      stop,
      reset,
      record,
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

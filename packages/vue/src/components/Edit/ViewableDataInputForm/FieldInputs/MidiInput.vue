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
import { ref, onCreated } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import SkMidi, {
  eventsToSyllableSequence,
  SyllableSequence,
  transposeSyllableSeq,
} from '@/courses/piano/utility/midi';
import SyllableSeqVis from '@/courses/piano/utility/SyllableSeqVis.vue';
import type { FieldInputProps } from '../FieldInput';

// Props inherited from FieldInput
const props = defineProps<FieldInputProps>();

// Setup composable
const { log } = SkldrComposable();

// Refs
const inputVis = ref<InstanceType<typeof SyllableSeqVis>>();
const midi = ref<SkMidi>();
const recording = ref(false);
const SylSeq = ref<SyllableSequence>(eventsToSyllableSequence([]));
const display = ref(false);
const transpositions = ref(false);

// Methods
const getTransposedSeqs = () => {
  if (transpositions.value) {
    return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(shift => {
      return transposeSyllableSeq(midi.value!.recording, shift);
    });
  }
  return [midi.value!.recording];
};

const record = () => {
  midi.value!.record();
  midi.value!.addNoteonListenter(e => {
    SylSeq.value.append(e);
    inputVis.value?.updateBounds();
  });
  recording.value = true;
};

const clearData = () => {
  log('midiInput clearing data...');
  midi.value!.stopRecording();
  midi.value!.eraseRecording();
  SylSeq.value = eventsToSyllableSequence([]);
  record();
  recording.value = true;

  props.store.convertedInput[props.field.name] = midi.value!.recording;
  props.store.validation[props.field.name] = false;
  props.store[props.field.name] = getTransposedSeqs;
};

const hasRecording = (): boolean => {
  if (midi.value) {
    if (midi.value.hasRecording) {
      return midi.value.hasRecording;
    }
  }
  return false;
};

const reset = () => {
  clearData();
};

const play = () => {
  midi.value!.play();
  display.value = true;
  validate();
};

// Lifecycle
onCreated(async () => {
  try {
    midi.value = await SkMidi.instance();
    record();
    props.store[props.field.name] = getTransposedSeqs;
  } catch (e) {
    throw e;
  }
});
</script>

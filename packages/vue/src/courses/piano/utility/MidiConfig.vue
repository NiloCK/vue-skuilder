<template>
  <v-card>
    <v-toolbar dense>
      <v-toolbar-title>Configure Midi Device</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form v-if="midiSupported" onsubmit="return false;">
        <v-select
          v-model="selectedInput"
          :items="inputs"
          label="Select Input"
          hint="Play some notes on your input device to test the connection"
        ></v-select>
        <v-select v-model="selectedOutput" :items="outputs" label="Select Output"></v-select>
        <v-btn class="mx-2" :loading="updatePending" @click="saveSettings"> Save these settings </v-btn>
        <v-btn class="mx-2" color="primary" @click="playSound">Test midi output</v-btn>
      </v-form>
      <div v-else>
        <p>This quilt requires a midi input device, which is not supported by this browser.</p>
        <div>
          <p>Try one of the following browsers:</p>
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
      <!-- Input: {{selectedInput}}
        Output: {{selectedOutput}} -->
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { alertUser } from '@/components/SnackbarService.vue';
import SkMidi from './midi';
import { Status } from '@vue-skuilder/common';
import { User } from '@/db/userDB';
import { InputEventNoteon } from 'webmidi';
import { getCurrentUser } from '@/stores/useAuthStore';

interface MidiDevice {
  text: string;
  value: string;
}
export default defineComponent({
  name: 'MidiConfig',

  props: {
    _id: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const midi = ref<SkMidi>();
    const midiSupported = ref(true);
    const inputs = ref<MidiDevice[]>([]);
    const outputs = ref<MidiDevice[]>([]);
    const selectedInput = ref<string>('');
    const selectedOutput = ref<string>('');
    const updatePending = ref(false);
    const user = ref<User>();

    const playSound = () => {
      midi.value?.play([
        {
          note: {
            number: 64,
            name: 'E',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.4251968503937008,
          timestamp: 0,
        },
        {
          note: {
            number: 64,
            name: 'E',
            octave: 4,
          },
          velocity: 0.3779527559055118,
          type: 'noteoff',
          timestamp: 511.90500000002794,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.5275590551181102,
          timestamp: 535.8800000001211,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          velocity: 0.33858267716535434,
          type: 'noteoff',
          timestamp: 674.9899999999907,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.5590551181102362,
          timestamp: 1070.8800000000047,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          velocity: 0.3464566929133858,
          type: 'noteoff',
          timestamp: 1214.8999999999069,
        },
        {
          note: {
            number: 64,
            name: 'E',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.5118110236220472,
          timestamp: 1424.9400000000605,
        },
        {
          note: {
            number: 64,
            name: 'E',
            octave: 4,
          },
          velocity: 0.2755905511811024,
          type: 'noteoff',
          timestamp: 1576.9150000000373,
        },
        {
          note: {
            number: 62,
            name: 'D',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.3937007874015748,
          timestamp: 1756.9149999999208,
        },
        {
          note: {
            number: 62,
            name: 'D',
            octave: 4,
          },
          velocity: 0.36220472440944884,
          type: 'noteoff',
          timestamp: 1926.9899999998743,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.5196850393700787,
          timestamp: 1970.9600000000792,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          velocity: 0.36220472440944884,
          type: 'noteoff',
          timestamp: 2126.009999999893,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.5984251968503937,
          timestamp: 2502.0050000000047,
        },
        {
          note: {
            number: 60,
            name: 'C',
            octave: 4,
          },
          velocity: 0.3858267716535433,
          type: 'noteoff',
          timestamp: 2853.920000000042,
        },
        {
          note: {
            number: 67,
            name: 'G',
            octave: 4,
          },
          type: 'noteon',
          velocity: 0.6850393700787402,
          timestamp: 2875.8649999999907,
        },
        {
          note: {
            number: 67,
            name: 'G',
            octave: 4,
          },
          velocity: 0.6377952755905512,
          type: 'noteoff',
          timestamp: 4497.004999999888,
        },
      ]);
    };

    const indicateHeardNotes = (note: InputEventNoteon) => {
      alertUser({
        text: `I hear a ${note.note.name}!`,
        status: Status.ok,
      });
    };

    watch(selectedInput, () => {
      midi.value?.selectInput(selectedInput.value);
    });

    watch(selectedOutput, () => {
      midi.value?.selectOutput(selectedOutput.value);
    });

    const retrieveSettings = async () => {
      const s = await user.value?.getCourseSettings(props._id);

      if (s?.midiinput) {
        const savedInput = s.midiinput.toString();
        // Check if the saved input device is still available
        const inputExists = inputs.value.some((input) => input.value === savedInput);
        if (inputExists) {
          selectedInput.value = savedInput;
        } else {
          alertUser({
            text: `Configured MIDI input device is no longer available`,
            status: Status.error,
          });
          console.warn('Previously saved MIDI input device is no longer available');
        }
      }

      if (s?.midioutput) {
        const savedOutput = s.midioutput.toString();
        // Check if the saved output device is still available
        const outputExists = outputs.value.some((output) => output.value === savedOutput);
        if (outputExists) {
          selectedOutput.value = savedOutput;
        } else {
          alertUser({
            text: `Configured MIDI output device is no longer available`,
            status: Status.error,
          });
          console.warn('Previously saved MIDI output device is no longer available');
        }
      }
    };

    const saveSettings = async () => {
      updatePending.value = true;
      await user.value?.updateCourseSettings(props._id, [
        {
          key: 'midiinput',
          value: selectedInput.value,
        },
        {
          key: 'midioutput',
          value: selectedOutput.value,
        },
      ]);
      updatePending.value = false;
    };

    onMounted(async () => {
      user.value = await getCurrentUser();
      try {
        midi.value = await SkMidi.instance();
        midiSupported.value = midi.value.state === 'ready' || midi.value.state === 'nodevice';
      } catch (e) {
        console.log(`Error on midi Init: ${e}`);
        midiSupported.value = false;
      }

      if (midiSupported.value) {
        midi.value?.addNoteonListenter(indicateHeardNotes);
        if (midi.value) {
          inputs.value = midi.value.inputs
            .filter((i) => i.state === 'connected')
            .map((i) => ({
              title: `${i.manufacturer}: ${i.name}`,
              value: i.id,
            }));
          outputs.value = midi.value?.outputs
            .filter((i) => i.state === 'connected')
            .map((i) => ({
              title: `${i.manufacturer}: ${i.name}`,
              value: i.id,
            }));
        } else {
          inputs.value = [{ title: 'No inputs available', value: '' }];
          outputs.value = [{ title: 'No outputs available', value: '' }];
        }

        await retrieveSettings();

        // Only set defaults if no saved settings were loaded
        if (!selectedInput.value && inputs.value.length > 0) {
          selectedInput.value = inputs.value[0].value;
        }

        if (!selectedOutput.value && outputs.value.length > 0) {
          selectedOutput.value = outputs.value[0].value;
        }
      }
    });

    return {
      midiSupported,
      inputs,
      outputs,
      selectedInput,
      selectedOutput,
      updatePending,
      playSound,
      saveSettings,
    };
  },
});
</script>

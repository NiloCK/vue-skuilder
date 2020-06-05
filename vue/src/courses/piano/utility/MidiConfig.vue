<template>
    <v-card>
        <v-card-title
            class="headline grey lighten-2"
            primary-title
        >
            Configure Midi Device
        </v-card-title>

        <v-card-text>
        <v-form
          v-if="midiSupported"
            onsubmit="return false;"  
        >
            <v-select
              :items="inputs"
              v-model="selectedInput"
              label="Select Input"
              hint="Play some notes on your input device to test the connection"
            ></v-select>            
            <v-select
              :items="outputs"
              v-model="selectedOutput"
              label="Select Output"
            ></v-select>  
            <v-btn
              @click='saveSettings'
              :loading='updatePending'
            >
              Save these settings
            </v-btn>
            <v-btn color="primary" @click="playSound">Test midi output</v-btn>

        </v-form>
        <div v-else>
          <p>
           This quilt requires a midi input device, which is not supported by this browser.
          </p>
          <p>
            Try one of the following browsers:
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
          </p>
        </div>
        <!-- Input: {{selectedInput}}
        Output: {{selectedOutput}} -->
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { alertUser } from '@/components/SnackbarService.vue';
import { log } from 'util';
import SkldrVue from '../../../SkldrVue';
import SkMidi from './midi';
import { Watch, Prop } from 'vue-property-decorator';
import { Status } from '../../../enums/Status';

@Component({})
export default class MidiConfig extends SkldrVue {
  @Prop() public _id: string;
  public midi: SkMidi;
  public midiSupported: boolean = true;

  public inputs: {
    text: string;
    value: {}
  }[] = [];
  public outputs: {
    text: string;
    value: {}
  }[] = [];

  public selectedInput: string = '';
  public selectedOutput: string = '';
  public updatePending: boolean = false;

  public playSound() {
    this.midi.play([
      {
        "note": {
          "number": 64,
          "name": "E",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.4251968503937008,
        "timestamp": 0
      },
      {
        "note": {
          "number": 64,
          "name": "E",
          "octave": 4
        },
        "velocity": 0.3779527559055118,
        "type": "noteoff",
        "timestamp": 511.90500000002794
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.5275590551181102,
        "timestamp": 535.8800000001211
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "velocity": 0.33858267716535434,
        "type": "noteoff",
        "timestamp": 674.9899999999907
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.5590551181102362,
        "timestamp": 1070.8800000000047
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "velocity": 0.3464566929133858,
        "type": "noteoff",
        "timestamp": 1214.8999999999069
      },
      {
        "note": {
          "number": 64,
          "name": "E",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.5118110236220472,
        "timestamp": 1424.9400000000605
      },
      {
        "note": {
          "number": 64,
          "name": "E",
          "octave": 4
        },
        "velocity": 0.2755905511811024,
        "type": "noteoff",
        "timestamp": 1576.9150000000373
      },
      {
        "note": {
          "number": 62,
          "name": "D",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.3937007874015748,
        "timestamp": 1756.9149999999208
      },
      {
        "note": {
          "number": 62,
          "name": "D",
          "octave": 4
        },
        "velocity": 0.36220472440944884,
        "type": "noteoff",
        "timestamp": 1926.9899999998743
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.5196850393700787,
        "timestamp": 1970.9600000000792
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "velocity": 0.36220472440944884,
        "type": "noteoff",
        "timestamp": 2126.009999999893
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.5984251968503937,
        "timestamp": 2502.0050000000047
      },
      {
        "note": {
          "number": 60,
          "name": "C",
          "octave": 4
        },
        "velocity": 0.3858267716535433,
        "type": "noteoff",
        "timestamp": 2853.920000000042
      },
      {
        "note": {
          "number": 67,
          "name": "G",
          "octave": 4
        },
        "type": "noteon",
        "velocity": 0.6850393700787402,
        "timestamp": 2875.8649999999907
      },
      {
        "note": {
          "number": 67,
          "name": "G",
          "octave": 4
        },
        "velocity": 0.6377952755905512,
        "type": "noteoff",
        "timestamp": 4497.004999999888
      }
    ]);
  }

  public indicateHeardNotes(note: any) {
    alertUser({
      text: `I hear a ${note.note.name}!`,
      status: Status.ok
    });
  }

  @Watch('selectedInput')
  setInput() {
    this.midi.selectInput(
      this.selectedInput
    );
  }
  @Watch('selectedOutput')
  setOutput() {
    this.midi.selectOutput(
      this.selectedOutput
    );
  }

  public async created() {
    try {
      this.midi = await SkMidi.instance();
      this.midiSupported = this.midi.state === 'ready' || this.midi.state === 'nodevice';
    } catch (e) {
      console.log(`Error on midi Init: ${e}`);
      this.midiSupported = false;
    }
    if (this.midiSupported) {
      this.midi.addNoteonListenter(this.indicateHeardNotes);
      this.inputs = this.midi.inputs
        .filter(i => i.state === 'connected')
        .map(i => {
          return {
            text: `${i.manufacturer}: ${i.name}`,
            value: i.id
          }
        });
      this.outputs = this.midi.outputs
        .filter(i => i.state === 'connected')
        .map(i => {
          return {
            text: `${i.manufacturer}: ${i.name}`,
            value: i.id
          }
        });

      // todo:
      // this.outputs.push({
      //   text: 'Computer Audio',
      //   value: ''
      // });

      this.selectedInput = this.inputs[0].text
      this.selectedOutput = this.outputs[0].text;

      this.retrieveSettings();
    }
  }

  public async retrieveSettings() {
    //todo
    this.$store.state._user!.getCourseSettings(this._id).then((s) => {
      if (s && s.midiinput) {
        this.selectedInput = s.midiinput.toString();
      }
      if (s && s.midioutput) {
        this.selectedOutput = s.midioutput.toString();
      }
    });
  }

  public async saveSettings() {
    this.updatePending = true;
    await this.$store.state._user!.updateCourseSettings(
      this._id,
      [
        {
          key: 'midiinput',
          value: this.selectedInput,
        },
        {
          key: 'midioutput',
          value: this.selectedOutput
        }
      ]
    );
    this.updatePending = false;
  }

}
</script>

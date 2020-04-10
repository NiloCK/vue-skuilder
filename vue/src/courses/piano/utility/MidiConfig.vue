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
        </v-form>
        <div v-else>
          Midi is not supported in this browser!
        </div>
        <!-- Input: {{selectedInput}}
        Output: {{selectedOutput}} -->
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { alertUser } from '@/components/SnackbarService.vue';
import { remoteDBLogin } from '@/db';
import { log } from 'util';
import SkldrVue from '../../../SkldrVue';
import SkMidi from './midi';
import { Watch, Prop } from 'vue-property-decorator';
import { updateCourseSetting } from '@/db/userDB';

@Component({})
export default class MidiConfig extends SkldrVue {
  @Prop() public _id: string;
  public midi: SkMidi;
  public midiSupported: boolean = false;

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

  public async created() {
    try {
      this.midi = await SkMidi.instance();
      this.midiSupported = true;
    } catch (e) {
      console.log(e);
      this.midiSupported = false;
    }
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
    this.outputs.push({
      text: 'Computer Audio',
      value: ''
    });
  }

  public async saveSettings() {
    this.updatePending = true;
    await updateCourseSetting({
      user: this.$store.state.user,
      course_id: this._id,
      settings: [
        {
          key: 'midiinput',
          value: this.selectedInput
        },
        {
          key: 'midioutput',
          value: this.selectedOutput
        }
      ]
    });
    this.updatePending = false;
  }

}
</script>

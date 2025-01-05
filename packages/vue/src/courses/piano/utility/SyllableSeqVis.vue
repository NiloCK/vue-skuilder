<template>
  <div>
    <svg :width="510" :height="Math.max(3 * (high - low) + 10, 0)">
      <template v-for="syl in seq.syllables">
        <template v-for="note in syl.notes">
          <circle
            @mouseenter="sayNote(note)"
            :key="syl.timestamp + '-' + note.note.number"
            :cx="((syl.timestamp - firstTS) * 500) / (lastTS - firstTS) + 4"
            :cy="3 * (high - note.note.number) + 4"
            :alt="note.note.name"
            r="3"
            :fill="note.isCorrect ? 'black' : note.isMissing ? 'none' : 'red'"
            :stroke="note.isMissing ? 'red' : 'none'"
          />
        </template>
      </template>
    </svg>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { log } from 'util';
import SkldrVue from '../../../SkldrVue';
import { SyllableSequence, NoteEvent } from './midi';

@Component({})
export default class SyllableSeqVis extends SkldrVue {
  @Prop()
  public seq: SyllableSequence;
  @Prop({
    required: false,
    default: 0,
  })
  public lastTSsuggestion: number;

  public firstTS: number = 0; // in ms
  public lastTS: number = 0; // in ms
  public high: number = 0;
  public low: number = 500;

  public sayNote(note: NoteEvent) {
    console.log(`${JSON.stringify(note)}`);
  }

  get getLastTS(): number {
    let min = 1;
    let ts = this.seq.syllables[this.seq.syllables.length - 1].timestamp;
    return Math.max(min, ts, this.lastTSsuggestion);
  }

  get getHeight(): number {
    let high = 0;
    let low = 500;
    this.seq.syllables.forEach(s => {
      s.notes.forEach(n => {
        if (n.note.number > high) {
          high = n.note.number;
        }
        if (n.note.number < low) {
          low = n.note.number;
        }
      });
    });
    return Math.max(3 * (high - low) + 10, 0);
  }

  public updateBounds() {
    try {
      this.firstTS = this.seq.syllables[0].timestamp;
      const dataTS = this.seq.syllables[this.seq.syllables.length - 1].timestamp;
      const suggestedTS = this.firstTS + this.lastTSsuggestion;

      this.lastTS = Math.max(dataTS, suggestedTS);
    } catch {}
    this.seq.syllables.forEach(s => {
      s.notes.forEach(n => {
        if (n.note.number > this.high) {
          this.high = n.note.number;
        }
        if (n.note.number < this.low) {
          this.low = n.note.number;
        }
      });
    });
  }

  created() {
    console.log(`SyllableSeqVis created w/ input: \n${this.seq}`);

    this.updateBounds();
  }
}
</script>

<style lang="css" scoped>
svg {
  border: 1px;
}
</style>

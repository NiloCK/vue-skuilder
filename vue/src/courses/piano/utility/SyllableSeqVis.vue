<template>
<div>

  <svg :width="510" :height="3 * (high - low) + 10">
    <template
      v-for="syl in seq.syllables"
    >
      <template
       v-for="note in syl.notes"
      >
        <circle
          @mouseenter="sayNote(note)"
          :key="syl.timestamp + '-' + note.note.number" 
          :cx="( syl.timestamp * 500 / lastTS ) + 4"
          :cy="3 * (high - note.note.number) + 4"
          :alt='note.note.name'
          r="3"
          :fill="note.isCorrect ? 'black' : 'red'"
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

  public lastTS: number = 0; // in ms
  public high: number = 0;
  public low: number = 500;

  public sayNote(note: NoteEvent) {
    console.log(`${JSON.stringify(note)}`);
  }

  created() {
    try {
      this.lastTS = this.seq.syllables[this.seq.syllables.length - 1].timestamp
    } catch { }
    this.seq.syllables.forEach(s => {
      s.notes.forEach((n) => {
        if (n.note.number > this.high) {
          this.high = n.note.number;
        }
        if (n.note.number < this.low) {
          this.low = n.note.number;
        }
      });
    })
  }
}
</script>

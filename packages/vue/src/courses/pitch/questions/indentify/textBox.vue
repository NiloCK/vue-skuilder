<template>
  <div>
    What note is being played?

    <radio-multiple-choice :choiceList="question.choiceList" />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { ChromaQuestion } from './index';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';

@Component({
  components: {
    RadioMultipleChoice,
  },
})
export default class IdentifyChroma extends QuestionView<ChromaQuestion> {
  public answer: string = '';
  public ctx: AudioContext = new AudioContext();
  get question() {
    return new ChromaQuestion(this.data);
  }
  public octaves(freq: number): number[] {
    let ret: number[] = [];
    let lowerFreq: number = freq / 2;
    while (lowerFreq > 100) {
      ret.push(lowerFreq);
      lowerFreq /= 2;
    }
    ret.push(freq);
    let above: number = freq * 2;
    while (above < 5000) {
      ret.push(above);
      above *= 2;
    }

    return ret;
  }
  public created() {
    this.octaves(295).forEach((t) => this.tone(t));
    // this.tone(3520) // audible
    // this.tone(1760) // audible
    // this.tone(880) // audible
    // this.tone(440)
    // this.tone(220) // low, audible
    // this.tone(110) // inaudible on dell
  }
  public tone(freq: number) {
    // const freq: number = 440; // Hz

    let osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    let g = this.ctx.createGain();
    this.log('Max Gain: ' + g.gain.maxValue);
    // g.gain.value = 0.01;
    g.gain.setValueAtTime(0, 0);
    // g.gain.setValueAtTime(0.025, 1);
    // g.gain.setValueAtTime(0.05, 2);
    // g.gain.setValueAtTime(0.075, 3);
    // g.gain.setValueAtTime(0.1, 4);
    // g.gain.setValueAtTime(0.2, 5);
    // g.gain.setValueAtTime(0., 6);
    // g.gain.setValueAtTime(0.4, 7);
    // g.gain.setValueAtTime(0., 8);
    // g.gain.setValueAtTime(0.6, 9);
    // g.gain.setValueAtTime(0., 10);
    // g.gain.setValueAtTime(0.8, 11);
    // g.gain.setValueAtTime(0., 12);
    // g.gain.setValueAtTime(1, 13);
    g.gain.linearRampToValueAtTime(0.5, 15);

    // sound, but no volume effect
    osc.connect(g);
    g.connect(this.ctx.destination);

    // sound, but no volume effect
    // osc.connect(this.ctx.destination);
    // g.connect(this.ctx.destination);

    osc.start(0);
    osc.stop(14);
  }

  public submit() {
    this.question.isCorrect(this.answer);
  }
}
</script>

<template>
<div>
  <span v-for="(section, index) in sections" :key='index'>
    <component :is="section.type" :text="section.text" />
  </span>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { BlanksCard } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';
import paper, { PaperScope } from 'paper';
import { log } from 'util';


@Component({
  components: {
    UserInputNumber
  }
})
export default class FillInView extends QuestionView<BlanksCard> {

  get question() {
    return this._question;
  }
  get sections() {
    return this.question.sections;
  }
  public $refs: {
    canvas: HTMLCanvasElement
  };
  private angle: number;
  private _question: BlanksCard;
  private _p: PaperScope;

  public beforeDestroy() {
    // destroy paperscope instance
    // this._p.
    delete this._p;
  }

  private created() {
    this._question = new BlanksCard(this.data);
  }


}
</script>

<style lang="css" scoped>
canvas {
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
}
</style>
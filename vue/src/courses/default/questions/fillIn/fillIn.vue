<template>
<div>
  <span v-for="(section, index) in sections" :key='index'>
    <!-- section {{index}}: {{section.type}} - "{{section.text}}"
    <br> -->
    <component :is="sectionType(section)" :text="section.text" />
  </span>

  <radio-multiple-choice
    v-if="question.options"
    :choiceList="question.options"
    :MouseTrap="MouseTrap"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { BlanksCard, FillInSection } from './index';
import FillInInput from './fillInInput.vue';
import FillInText from './fillInText.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import { log } from 'util';
import { type } from 'os';

const typeMap: {
  [index: string]: string
} = {
  text: 'textType',
  blank: 'blankType'
};

@Component({
  components: {
    RadioMultipleChoice,
    blankType: FillInInput,
    textType: FillInText
  }
})
export default class FillInView extends QuestionView<BlanksCard> {

  get question() {
    return new BlanksCard(this.data);
  }
  get sections() {
    return this.question.sections;
  }
  public $refs: {
    canvas: HTMLCanvasElement
  };
  private angle: number;
  private _question: BlanksCard;

  // public beforeDestroy() { }
  private created() {
    this._question = new BlanksCard(this.data);
  }
  private sectionType(section: FillInSection): string {
    return typeMap[section.type];
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
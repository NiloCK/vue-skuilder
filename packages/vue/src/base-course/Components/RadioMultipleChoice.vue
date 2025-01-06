<template>
  <div class="multipleChoice">
    <MultipleChoiceOption
      v-for="(choice, i) in choiceList"
      v-bind:key="i"
      v-bind:content="choice"
      v-bind:selected="choiceList.indexOf(choice) === currentSelection"
      v-bind:number="choiceList.indexOf(choice)"
      v-bind:setSelection="setSelection"
      v-bind:submit="forwardSelection"
      v-bind:markedWrong="choiceIsWrong(choice)"
    />
  </div>
</template>

<script lang="ts">
import UserInput from '@/base-course/Components/UserInput/UserInput';
import MultipleChoiceOption from './MultipleChoiceOption.vue';
import { Answer } from '../Displayable';
import { PropType } from 'vue';

export interface RadioSelectAnswer extends Answer {
  choiceList: string[];
  selection: number;
}

export default {
  name: 'RadioSelect',
  extends: UserInput,
  components: {
    MultipleChoiceOption,
  },
  props: {
    choiceList: {
      type: Array as PropType<string[]>,
      required: true,
    },
    MouseTrap: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      currentSelection: -1,
      incorrectSelections: [] as number[],
    };
  },
  mounted() {
    this.$el.focus();
  },
  created() {
    this.MouseTrap.bind('left', this.decrementSelection);
    this.MouseTrap.bind('right', this.incrementSelection);
    this.MouseTrap.bind('enter', this.forwardSelection);

    for (let i = 0; i < this.choiceList.length; i++) {
      this.bindNumberKey(i + 1);
    }
  },
  methods: {
    forwardSelection(): void {
      if (this.choiceIsWrong(this.choiceList[this.currentSelection])) {
        return;
      } else if (this.currentSelection !== -1) {
        const ans: RadioSelectAnswer = {
          choiceList: this.choiceList,
          selection: this.currentSelection,
        };
        const record = this.submitAnswer(ans);

        if (!record.isCorrect) {
          this.incorrectSelections.push(this.currentSelection);
        }
      }
    },
    setSelection(selection: number): void {
      if (selection < this.choiceList.length) {
        this.currentSelection = selection;
      }
    },
    incrementSelection(): void {
      if (this.currentSelection === -1) {
        this.currentSelection = Math.ceil(this.choiceList.length / 2);
      } else {
        this.currentSelection = Math.min(this.choiceList.length - 1, this.currentSelection + 1);
      }
    },
    decrementSelection(): void {
      if (this.currentSelection === -1) {
        this.currentSelection = Math.floor(this.choiceList.length / 2 - 1);
      } else {
        this.currentSelection = Math.max(0, this.currentSelection - 1);
      }
    },
    choiceIsWrong(choice: string): boolean {
      let ret = false;
      this.incorrectSelections.forEach((sel) => {
        if (this.choiceList[sel] === choice) {
          ret = true;
        }
      });
      return ret;
    },
    bindNumberKey(n: number): void {
      this.MouseTrap.bind(n.toString(), () => {
        this.currentSelection = n - 1;
      });
    },
  },
};
</script>

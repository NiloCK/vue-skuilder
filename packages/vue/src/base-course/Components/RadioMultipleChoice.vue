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
import { defineComponent, ref, PropType, onMounted, onBeforeMount } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import MultipleChoiceOption from './MultipleChoiceOption.vue';
import { Answer } from '../Displayable';
import UserInput from '@/base-course/Components/UserInput/UserInput';

export interface RadioSelectAnswer extends Answer {
  choiceList: string[];
  selection: number;
}

export default defineComponent({
  name: 'RadioSelect',
  components: {
    MultipleChoiceOption,
  },
  props: {
    choiceList: {
      type: Array as PropType<string[]>,
      required: true
    },
    MouseTrap: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { log, error, warn } = SkldrComposable();
    const currentSelection = ref(-1);
    const incorrectSelections = ref<number[]>([]);

    const setSelection = (selection: number): void => {
      if (selection < props.choiceList.length) {
        currentSelection.value = selection;
      }
    };

    const incrementSelection = () => {
      if (currentSelection.value === -1) {
        currentSelection.value = Math.ceil(props.choiceList.length / 2);
      } else {
        currentSelection.value = Math.min(props.choiceList.length - 1, currentSelection.value + 1);
      }
    };

    const decrementSelection = () => {
      if (currentSelection.value === -1) {
        currentSelection.value = Math.floor(props.choiceList.length / 2 - 1);
      } else {
        currentSelection.value = Math.max(0, currentSelection.value - 1);
      }
    };

    const choiceIsWrong = (choice: string): boolean => {
      let ret = false;
      incorrectSelections.value.forEach((sel) => {
        if (props.choiceList[sel] === choice) {
          ret = true;
        }
      });
      return ret;
    };

    const bindNumberKey = (n: number): void => {
      props.MouseTrap.bind(n.toString(), () => {
        currentSelection.value = n - 1;
      });
    };

    // Note: This requires UserInput functionality to be provided differently
    const forwardSelection = (): void => {
      if (choiceIsWrong(props.choiceList[currentSelection.value])) {
        return;
      } else if (currentSelection.value !== -1) {
        const ans: RadioSelectAnswer = {
          choiceList: props.choiceList,
          selection: currentSelection.value,
        };
        // TODO: This needs to be implemented differently as we don't have access to UserInput's submitAnswer
        // const record = submitAnswer(ans);
        // if (!record.isCorrect) {
        //   incorrectSelections.value.push(currentSelection.value);
        // }
      }
    };

    onBeforeMount(() => {
      props.MouseTrap.bind('left', decrementSelection);
      props.MouseTrap.bind('right', incrementSelection);
      props.MouseTrap.bind('enter', forwardSelection);

      for (let i = 0; i < props.choiceList.length; i++) {
        bindNumberKey(i + 1);
      }
    });

    onMounted(() => {
      // Note: This might need adjustment for Vue 3
      const el = document.querySelector('.multipleChoice');
      if (el) el.focus();
    });

    return {
      currentSelection,
      incorrectSelections,
      setSelection,
      forwardSelection,
      choiceIsWrong
    };
  }
});
</script>

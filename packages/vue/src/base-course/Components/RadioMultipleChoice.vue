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
import { defineComponent, ref, onMounted, onBeforeMount, PropType } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import MultipleChoiceOption from './MultipleChoiceOption.vue';
import { Answer } from '../Displayable';
import { useStore } from 'vuex';

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
      required: true,
    },
    MouseTrap: {
      type: Object,
      required: false,
    },
  },

  setup(props, { emit }) {
    const { log, error, warn } = SkldrComposable();
    const store = useStore();
    
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
      props.MouseTrap?.bind(n.toString(), () => {
        currentSelection.value = n - 1;
      });
    };

    const forwardSelection = (): void => {
      if (choiceIsWrong(props.choiceList[currentSelection.value])) {
        return;
      } else if (currentSelection.value !== -1) {
        const ans: RadioSelectAnswer = {
          choiceList: props.choiceList,
          selection: currentSelection.value,
        };
        // Note: This needs to be handled differently as UserInput base class functionality
        emit('submit-answer', ans);
      }
    };

    onMounted(() => {
      // Focus functionality from mounted hook
      const el = document.querySelector('.multipleChoice');
      el?.focus();
    });

    onBeforeMount(() => {
      props.MouseTrap?.bind('left', decrementSelection);
      props.MouseTrap?.bind('right', incrementSelection);
      props.MouseTrap?.bind('enter', forwardSelection);

      for (let i = 0; i < props.choiceList.length; i++) {
        bindNumberKey(i + 1);
      }
    });

    return {
      currentSelection,
      incorrectSelections,
      setSelection,
      forwardSelection,
      choiceIsWrong,
    };
  },
});
</script>

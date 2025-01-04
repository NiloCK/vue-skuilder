<template>
  <v-card v-bind:class="`${className}`" v-on:mouseover="select" v-on:click="submitThisOption">
    <markdown-renderer v-bind:md="content" />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'MultipleChoiceOption',
  
  components: {
    MarkdownRenderer: () => import('@/base-course/Components/MarkdownRenderer.vue'),
  },

  props: {
    content: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    setSelection: {
      type: Function as PropType<(selection: number) => void>,
      required: true
    },
    submit: {
      type: Function as PropType<() => void>,
      required: true
    },
    markedWrong: {
      type: Boolean,
      required: true
    }
  },

  setup(props) {
    const { log, error } = SkldrComposable();

    const select = (): void => {
      props.setSelection(props.number);
    };

    const submitThisOption = (): void => {
      if (props.markedWrong) {
        return;
      } else {
        select();
        props.submit();
      }
    };

    const className = computed((): string => {
      let color: string;

      switch (props.number) {
        case 0:
          color = 'red';
          break;
        case 1:
          color = 'purple';
          break;
        case 2:
          color = 'indigo';
          break;
        case 3:
          color = 'light-blue';
          break;
        case 4:
          color = 'teal';
          break;
        case 5:
          color = 'deep-orange';
          break;
        default:
          color = 'grey';
          break;
      }

      if (props.selected && !props.markedWrong) {
        return `choice selected ${color} lighten-3 elevation-8`;
      } else if (!props.selected && !props.markedWrong) {
        return `choice not-selected ${color} lighten-4 elevation-1`;
      } else if (props.selected && props.markedWrong) {
        return `choice selected grey lighten-2 elevation-8`;
      } else if (!props.selected && props.markedWrong) {
        return 'choice not-selected grey lighten-2 elevation-0';
      } else {
        throw new Error(`'selected' and 'markedWrong' props in MultipleChoiceOption are in an impossible configuration.`);
      }
    });

    return {
      select,
      submitThisOption,
      className
    };
  }
});
</script>

<style scoped>
.choice {
  text-align: center;
  display: inline-block;
  border-radius: 4px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
  margin: 10px;
  min-width: 75px; /* prevent tiny click-btns on, eg, one-letter answers */
  transition: all 0.2s ease-in-out;
}

.selected {
  transform: translateY(-10px) /* rotate(3deg) */ scale(1.15);
  z-index: 1;
}

.not-selected {
  z-index: 0;
}
</style>

<template>
  <div>
    <RadioSelect :choiceList="['True', 'False']" :MouseTrap="MouseTrap" :submit="submit" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import RadioSelect from './RadioMultipleChoice.vue';

export default Vue.extend({
  name: 'TrueFalse',
  components: {
    RadioSelect,
  },
  props: {
    MouseTrap: {
      type: Object as PropType<any>,
      required: true,
    },
    submit: {
      type: Function as PropType<(selection: number) => void>,
      required: true,
    },
  },
});
</script>

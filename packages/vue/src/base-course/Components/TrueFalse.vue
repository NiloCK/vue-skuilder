<template>
  <div>
    <RadioSelect :choiceList="['True', 'False']" :MouseTrap="MouseTrap" :submit="submit" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import RadioSelect from './RadioMultipleChoice.vue';

@Component({
  components: {
    RadioSelect,
  },
})
export default class TrueFalse extends Vue {
  @Prop() public MouseTrap: any;
  @Prop() public submit: (selection: number) => void;
}
</script>

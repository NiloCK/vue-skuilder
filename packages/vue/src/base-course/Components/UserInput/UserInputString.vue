<template>
  <v-text-field
    v-model="answer"
    :prepend-icon="prependIcon"
    @keyup.enter="submitAnswer(answer)"
    :autofocus="autofocus"
    toggle-keys="[13,32]"
    type="text"
    class="headline"
    single-line
    hide-details
    hide-headers
    hide-overlay
  ></v-text-field>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserInput from './UserInput';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default defineComponent({
  name: 'UserInputString',
  mixins: [SkldrVueMixin],
  extends: UserInput,
  
  props: {
    icon: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  computed: {
    prependIcon(): string {
      return this.icon ? 'edit' : '';
    }
  },

  mounted() {
    this.$el.focus();
  }
});
</script>

<style scoped>
.v-text-field {
  padding: 0;
}
input {
  text-align: center !important;
}
</style>

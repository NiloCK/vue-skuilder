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
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserInput from './UserInput';

@Component({})
export default class UserInputString extends UserInput {
  @Prop({
    required: false,
    default: true,
  })
  public icon: boolean;

  private get prependIcon(): string {
    return this.icon ? 'edit' : '';
  }

  public mounted() {
    this.$el.focus();
  }
}
</script>

<style scoped>
.v-text-field {
  padding: 0;
}
input {
  text-align: center !important;
}
</style>

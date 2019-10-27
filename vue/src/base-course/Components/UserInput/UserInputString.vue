<template>
    <v-text-field
        v-model="answer"
        :prepend-icon="prependIcon"
        @keyup.enter="submitAnswer(answer)"
        autofocus
        row-height="24"
        toggle-keys="[13,32]"
        type="text"
        class='headline'

    ></v-text-field>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserInput from './UserInput';

@Component({})
export default class UserInputString extends UserInput {
  @Prop({
    required: false,
    default: true
  }) public icon: boolean;

  private get prependIcon(): string {
    return this.icon ? 'edit' : '';
  }

  public mounted() {
    this.$el.focus();
  }

}
</script>

<style scoped>
</style>

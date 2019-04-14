<template>
    <v-text-field
        v-model="answer"
        prepend-icon="edit"
        @keyup.enter="submitAnswer(answer)"
        autofocus
        row-height="24"
        toggle-keys="[13,32]"
        type="text"
    ></v-text-field>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserInput from './UserInput';

@Component({})
export default class UserInputString extends UserInput {
  public mounted() {
    this.$el.focus();
  }
}
</script>

<style scoped>
.userInput {
  border: none;
  text-align: center;
  border-bottom: 1px black;
}
</style>

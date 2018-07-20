<template>
    <input
        class="userInput"
        v-model="answer"
        @keyup.enter="submitAnswer(answer)"
    />
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

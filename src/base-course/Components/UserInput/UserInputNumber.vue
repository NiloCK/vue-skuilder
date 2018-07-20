<template>
    <input
        class='userInput'
        type="number"
        v-model="answer"
        @keyup.enter="submitAnswer(strToNumber(answer))"
    />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserInput from './UserInput';

@Component({})
export default class UserInputNumber extends UserInput {
    public mounted() {
        this.$el.focus();
    }

    private strToNumber(num: string): number {
        return Number.parseFloat(num);
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

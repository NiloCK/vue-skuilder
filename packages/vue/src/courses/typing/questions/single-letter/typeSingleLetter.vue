<template>
  <div>
    <p class="headline">Type this letter!</p>
    <div class="letter-display">{{ question.letter }}</div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { TypeLetterQuestion } from './index';

@Component({})
export default class LetterQuestionView extends QuestionView<TypeLetterQuestion> {
  get question() {
    return new TypeLetterQuestion(this.data);
  }

  mounted() {
    window.addEventListener('keypress', this.handleKeyPress);
  }

  destroyed() {
    window.removeEventListener('keypress', this.handleKeyPress);
  }

  handleKeyPress(event: KeyboardEvent) {
    const pressedKey = event.key.toLowerCase();
    const targetKey = this.question.letter.toLowerCase();

    if (pressedKey === targetKey) {
      const letterDisplay = document.querySelector('.letter-display');
      letterDisplay?.classList.add('pressed');

      // Remove pressed class and submit answer after key release
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === targetKey) {
          letterDisplay?.classList.remove('pressed');
          this.submitAnswer(pressedKey);
          window.removeEventListener('keyup', handleKeyUp);
        }
      };

      window.addEventListener('keyup', handleKeyUp);
    } else {
      this.submitAnswer(pressedKey);
    }
  }
}
</script>

<style scoped>
.letter-display {
  font-size: 48px;
  font-weight: bold;
  font-family: monospace;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 0 #dee2e6, 0 3px 3px rgba(0, 0, 0, 0.2);
  margin: 20px auto;
  color: #333;
  text-transform: uppercase;
}

.letter-display.pressed {
  box-shadow: 0 0 0 #dee2e6, 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(2px);
}
</style>

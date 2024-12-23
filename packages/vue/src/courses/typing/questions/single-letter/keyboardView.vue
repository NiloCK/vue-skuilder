<template>
  <div class="keyboard-layout">
    <p class="headline">Type this letter!</p>
    <div class="keyboard">
      <!-- Row 1: Q to P -->
      <div class="keyboard-row">
        <div
          v-for="key in 'QWERTYUIOP'.split('')"
          :key="key"
          :class="['key', { highlight: key === question.letter.toUpperCase() }]"
        >
          {{ key }}
        </div>
      </div>
      <!-- Row 2: A to L -->
      <div class="keyboard-row">
        <div
          v-for="key in 'ASDFGHJKL'.split('')"
          :key="key"
          :class="['key', { highlight: key === question.letter.toUpperCase() }]"
        >
          {{ key }}
        </div>
      </div>
      <!-- Row 3: Z to M -->
      <div class="keyboard-row">
        <div
          v-for="key in 'ZXCVBNM'.split('')"
          :key="key"
          :class="['key', { highlight: key === question.letter.toUpperCase() }]"
        >
          {{ key }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { TypeLetterQuestion } from './index';

@Component({})
export default class KeyboardQuestionView extends QuestionView<TypeLetterQuestion> {
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
      const keyElement = document.querySelector('.key.highlight');
      keyElement?.classList.add('pressed');

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === targetKey) {
          keyElement?.classList.remove('pressed');
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
.keyboard-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: left;
  padding: 2px;
}

.keyboard {
  background-color: #e9ecef;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.keyboard-row {
  display: flex;
  justify-content: left;
  margin-bottom: 8px;
}
.keyboard-row:nth-child(2) {
  padding-left: 20px;
}

.keyboard-row:nth-child(3) {
  padding-left: 45px;
}

.key {
  width: 40px;
  height: 40px;
  margin: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: monospace;
  font-size: 18px;
  color: #495057;
  box-shadow: 0 2px 0 #ced4da;
  user-select: none;
}

.key.highlight {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
  box-shadow: 0 2px 0 #0056b3;
}

.key.highlight.pressed {
  transform: translateY(2px);
  box-shadow: 0 0 0 #0056b3;
}
</style>

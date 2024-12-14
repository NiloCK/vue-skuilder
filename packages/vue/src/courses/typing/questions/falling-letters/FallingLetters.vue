<template>
  <div class="game-container">
    <div class="stats">
      <div class="time">Time: {{ timeLeft.toFixed(1) }}s</div>
      <div class="score">Score: {{ score }}</div>
    </div>
    <div ref="gameArea" class="game-area">
      <div
        v-for="letter in letters"
        :key="letter.id"
        class="falling-letter"
        :style="{
          left: letter.x + 'px',
          top: letter.y + 'px',
        }"
      >
        <div class="meteor-effect"></div>
        <span class="letter-text">{{ letter.char }}</span>
      </div>

      <!-- Grass effect -->
      <div class="grass-container">
        <div class="grass"></div>
        <div class="grass-overlay"></div>
      </div>
      <div class="trees">
        <div
          class="tree"
          v-for="tree in treePositions"
          :key="tree.id"
          :style="{
            left: `${tree.left}%`,
            height: `${tree.height}px`,
            transform: `scale(${tree.scale})`,
          }"
        >
          <div class="tree-crown"></div>
          <div class="tree-trunk"></div>
        </div>
      </div>
    </div>
    <div v-if="gameOver" class="game-over">
      {{ gameOverMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { FallingLettersQuestion } from './index';

interface Letter {
  id: number;
  char: string;
  x: number;
  y: number;
}

interface TreePosition {
  id: number;
  left: number;
  height: number;
  scale: number;
}

@Component({})
export default class FallingLettersView extends QuestionView<FallingLettersQuestion> {
  letters: Letter[] = [];
  gameOver = false;
  gameOverMessage = '';
  timeLeft = 30;
  score = 0;
  currentSpeed = 2;
  letterId = 0;
  gameLoop: number | null = null;
  lastSpawn = 0;
  lastUpdate = 0;
  spawnInterval = 1000; // Spawn a new letter every second

  get question() {
    return new FallingLettersQuestion(this.data);
  }

  treePositions: TreePosition[] = [];

  mounted() {
    window.addEventListener('keypress', this.handleKeyPress);
    this.startGame();
    this.generateTrees();
  }

  generateTrees() {
    this.treePositions = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      left: 20 + i * Math.random() * 30 - 10,
      height: 100 + Math.random() * 120,
      scale: 1 + Math.random() * 2,
    }));
  }

  destroyed() {
    window.removeEventListener('keypress', this.handleKeyPress);
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
  }

  startGame() {
    this.timeLeft = this.question.gameLength;
    this.currentSpeed = this.question.initialSpeed;
    this.spawnInterval = this.question.spawnInterval * 1000;
    this.lastUpdate = performance.now();
    this.lastSpawn = performance.now();
    this.gameLoop = requestAnimationFrame(this.update);
  }

  spawnLetter() {
    if (!this.$refs.gameArea) return;

    const gameArea = this.$refs.gameArea as HTMLElement;
    const letter: Letter = {
      id: this.letterId++,
      char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      x: Math.random() * (gameArea.clientWidth - 30),
      y: -30, // Start slightly above the visible area
    };

    this.letters.push(letter);
  }

  update(timestamp: number) {
    if (this.gameOver) return;

    const deltaTime = (timestamp - this.lastUpdate) / 1000;
    this.lastUpdate = timestamp;

    // Update time
    this.timeLeft -= deltaTime;
    this.currentSpeed += this.question.acceleration * deltaTime;

    // Check win condition
    if (this.timeLeft <= 0) {
      this.win();
      return;
    }

    // Spawn new letters
    if (timestamp - this.lastSpawn >= this.spawnInterval) {
      this.spawnLetter();
      this.lastSpawn = timestamp;
      // Gradually decrease spawn interval (make it harder)
      this.spawnInterval = Math.max(500, this.spawnInterval - 10);
    }

    // Update letters positions
    const gameArea = this.$refs.gameArea as HTMLElement;
    this.letters = this.letters.filter(letter => {
      letter.y += this.currentSpeed;
      if (letter.y > gameArea.clientHeight) {
        this.lose();
        return false;
      }
      return true;
    });

    this.gameLoop = requestAnimationFrame(this.update);
  }

  handleKeyPress(event: KeyboardEvent) {
    if (this.gameOver) return;

    const pressedKey = event.key.toUpperCase();
    const letterIndex = this.letters.findIndex(l => l.char === pressedKey);

    if (letterIndex !== -1) {
      this.letters.splice(letterIndex, 1);
      this.score++;
    }
  }

  win() {
    this.gameOver = true;
    this.gameOverMessage = 'You Win!';
    this.submitAnswer('win');
  }

  lose() {
    this.gameOver = true;
    this.gameOverMessage = 'Game Over!';
    this.submitAnswer('lose');
  }
}
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 400px;
  position: relative;
}

.game-area {
  z-index: 0;
  width: 100%;
  height: 100%;
  background-color: #87ceeb; /* Sky blue background */
  border: 2px solid #dee2e6;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.grass-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  overflow: hidden;
  z-index: 3;
}

.grass {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: #4caf50;
  border-top: 2px solid #388e3c;
}

.grass-overlay {
  z-index: 3;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: repeating-linear-gradient(
      80deg,
      transparent,
      transparent 5px,
      rgba(76, 175, 80, 0.8) 5px,
      rgba(76, 175, 80, 0.8) 10px
    ),
    repeating-linear-gradient(
      -80deg,
      transparent,
      transparent 5px,
      rgba(76, 175, 80, 0.8) 5px,
      rgba(76, 175, 80, 0.8) 10px
    );
}

.falling-letter {
  position: absolute;
  width: 40px;
  height: 45px;
  z-index: 1;
  transition: top 16ms linear;
}

.meteor-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 40% 40%, #ff6b6b, #c92a2a);
  border-radius: 50%;
  box-shadow: 0 0 10px #ff8f8f, 0 0 20px #ff6b6b, 0 0 30px #c92a2a, 0 4px 8px rgba(0, 0, 0, 0.4);
  animation: meteorSpin 1s linear infinite;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 20px;
    background: linear-gradient(to top, rgba(255, 107, 107, 0.8), rgba(255, 107, 107, 0.4), transparent);
    filter: blur(1px);
  }

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 15px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8), rgba(255, 143, 143, 0.4), transparent);
    filter: blur(2px);
  }
}

.letter-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

@keyframes meteorSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stats {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  font-size: 18px;
  color: #333;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  z-index: 4;
}

.game-over {
  z-index: 3;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-weight: bold;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  z-index: 4;
}

.time,
.score {
  margin: 5px 0;
}

.trees {
  position: absolute;
  bottom: 20px; /* Adjust to sit on grass */
  width: 100%;
  height: 0;
  z-index: 2;
}

.tree {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
}

.tree-crown {
  z-index: 2;
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 40px;
  background: radial-gradient(circle at 50% 25%, #2d5a27, #1a472a);
  border-radius: 50% 50% 20% 20%;
  box-shadow: -2px 3px 0 #1a472a, 2px 3px 0 #1a472a;
}

.tree-trunk {
  z-index: 2;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 15px;
  background: linear-gradient(to right, #3e2723 20%, #5d4037 50%, #3e2723 80%);
  border-radius: 2px;
}

.grass,
.grass-overlay {
  z-index: 3;
}
</style>

// stores/useConfigStore.ts
import { defineStore } from 'pinia';

export interface UserConfig {
  darkMode: boolean;
  likesConfetti: boolean;
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    // [ ] read from the database
    config: {
      darkMode: false,
      likesConfetti: false,
    } as UserConfig,
  }),

  actions: {
    updateConfig(newConfig: UserConfig) {
      // [ ] write to the database
      this.config = newConfig;
    },
    updateDarkMode(darkMode: boolean) {
      // [ ] write to the database
      this.config.darkMode = darkMode;
    },
    updateLikesConfetti(likesConfetti: boolean) {
      this.config.likesConfetti = likesConfetti;
    },
  },
});

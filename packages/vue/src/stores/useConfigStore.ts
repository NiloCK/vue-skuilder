// stores/useConfigStore.ts
import { defineStore } from 'pinia';
import { getCurrentUser } from './useAuthStore';

export interface UserConfig {
  darkMode: boolean;
  likesConfetti: boolean;
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: {
      darkMode: false,
      likesConfetti: false,
    } as UserConfig,
  }),

  actions: {
    updateConfig(newConfig: UserConfig) {
      this.config = newConfig;
    },
    async updateDarkMode(darkMode: boolean) {
      this.config.darkMode = darkMode;
      const user = await getCurrentUser();
      await user.setConfig({
        darkMode,
      });
    },

    async updateLikesConfetti(likesConfetti: boolean) {
      this.config.likesConfetti = likesConfetti;
      const user = await getCurrentUser();
      await user.setConfig({
        likesConfetti,
      });
    },

    async hydrate() {
      const user = await getCurrentUser();
      const cfg = await user.getConfig();
      console.log(`user config: ${JSON.stringify(cfg)}`);
      this.updateConfig(cfg);
    },
    async init() {
      await this.hydrate();
    },
    resetDefaults() {
      this.config = {
        darkMode: false,
        likesConfetti: false,
      };
    },
  },
});

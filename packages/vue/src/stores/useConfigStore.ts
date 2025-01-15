// stores/useConfigStore.ts
import { defineStore } from 'pinia';
import { User } from '@/db/userDB';

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
      const u = await User.instance();
      await u.setConfig({
        darkMode,
      });
    },
    async updateLikesConfetti(likesConfetti: boolean) {
      this.config.likesConfetti = likesConfetti;
      const u = await User.instance();
      await u.setConfig({
        likesConfetti,
      });
    },
    async hydrate() {
      const u = await User.instance();
      const cfg = await u.getConfig();

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

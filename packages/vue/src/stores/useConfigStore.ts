// stores/useConfigStore.ts
import { defineStore } from 'pinia';
import { User } from '@/db/userDB';
import { UserConfig } from '@/store';

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
      await u.setConfig(this.config);
    },
    async updateLikesConfetti(likesConfetti: boolean) {
      this.config.likesConfetti = likesConfetti;
      const u = await User.instance();
      await u.setConfig(this.config);
    },
    async hydrate() {
      const u = await User.instance();
      const cfg = await u.getConfig();

      this.updateConfig(cfg);
    },
    async init() {
      await this.hydrate();
    },
  },
});

<template>
  <div class="text-subtitle-1">
    <v-alert v-if="isNewUser" type="success" class="text-subtitle-1" variant="tonal" :prepend-icon="'mdi-check'">
      Welcome, {{ _id }}! Please take a moment to look through these settings:
    </v-alert>

    <h1 class="text-h3">Account Settings</h1>
    <h2 class="text-h4">General:</h2>

    <v-checkbox
      label="I like confetti"
      v-model="configStore.config.likesConfetti"
      @update:model-value="updateConfetti"
    />
    <v-checkbox label="I like the dark" v-model="configStore.config.darkMode" @update:model-value="updateDark" />
    <!-- <h2 class="text-h4">Languages:</h2>
    I am near-fluent or better in the following languages:
    {{ selectedLanguages.toString() }}
    <v-checkbox
      v-for="(language, i) in configLanguages"
      :key="i"
      :label="language.name"
      :value="language.code"
      v-model="selectedLanguages"
      @update:model-value="updateLanguage"
    /> -->
  </div>
</template>

<script lang="ts">
import confetti from 'canvas-confetti';
import { defineComponent, PropType } from 'vue';
import { User } from '@/db/userDB';
import { useConfigStore } from '@/stores/useConfigStore';

interface Language {
  name: string;
  code: string;
}

export default defineComponent({
  name: 'User',

  props: {
    _id: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup() {
    const configStore = useConfigStore();

    let darkMode = configStore.config.darkMode;
    let likesConfetti = configStore.config.likesConfetti;

    return { configStore, darkMode, likesConfetti };
  },

  data() {
    return {
      u: {} as User,
      configLanguages: [
        {
          name: 'English',
          code: 'en',
        },
        {
          name: 'French',
          code: 'fr',
        },
      ] as Language[],
      selectedLanguages: [] as string[],
    };
  },

  computed: {
    isNewUser(): boolean {
      console.error(`Not implemented: User.isNewUser`);
      return false;
      // [ ] #vue3 - $route not available.
      // return this.$route.path.endsWith('new');
    },
  },

  methods: {
    updateDark(): void {
      this.configStore.updateDarkMode(this.configStore.config.darkMode);
    },

    updateConfetti(): void {
      this.configStore.updateLikesConfetti(this.configStore.config.likesConfetti);

      if (this.configStore.config.likesConfetti) {
        confetti({
          origin: {
            x: 0.5,
            y: 1,
          },
        });
      }
    },
  },

  async created() {
    this.u = await User.instance();
    this.configLanguages.forEach((l) => {
      console.log(`afweatifvwzeatfvwzeta` + l.name);
    });
  },
});
</script>

<style scoped></style>

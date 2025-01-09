<template>
  <div class="subheading">
    <div v-if="isNewUser" class="v-alert success subheading">
      <v-icon left dark>check</v-icon>
      Welcome, {{ _id }}! Please take a moment to look through these settings:
    </div>

    <h1 class="display-2">Account Settings</h1>
    <h2 class="display-1">General:</h2>

    <v-checkbox label="I like confetti" v-model="confetti" @click.capture="updateConfetti" />
    <v-checkbox label="I like the dark" v-model="darkMode" @click.capture="updateDark" />
    <!-- <h2 class="display-1">Languages:</h2>
    I am near-fluent or better in the following languages:
    {{ selectedLanguages.toString() }}
    <v-checkbox
      v-for="(language, i) in configLanguages"
      :key="i"
      :label="language.name"
      :value="language.code"
      v-model="selectedLanguages"
      @click.capture="updateLanguage"
    /> -->
  </div>
</template>

<script lang="ts">
import confetti from 'canvas-confetti';
import { defineComponent, PropType } from 'vue';

interface Language {
  name: string;
  code: string;
}

export default defineComponent({
  name: 'User',

  props: {
    _id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      u: this.$store.state._user!,
      confetti: this.$store.state.config.likesConfetti as boolean,
      darkMode: this.$store.state.config.darkMode as boolean,
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
      selectedLanguages: [] as string[]
    }
  },

  computed: {
    isNewUser(): boolean {
      return this.$route.path.endsWith('new');
    }
  },

  methods: {
    updateDark(): void {
      this.u.setConfig({
        darkMode: this.darkMode,
      });
      this.$store.state.config.darkMode = this.darkMode;
    },

    updateConfetti(): void {
      console.log(`Confetti updated...`);
      this.u.setConfig({
        likesConfetti: this.confetti,
      });
      this.$store.state.config.likesConfetti = this.confetti;

      if (this.$store.state.config.likesConfetti) {
        confetti({
          origin: {
            x: 0.5,
            y: 1,
          },
        });
      }
    }
  },

  created() {
    this.configLanguages.forEach((l) => {
      console.log(`afweatifvwzeatfvwzeta` + l.name);
    });
  }
});
</script>

<style scoped></style>

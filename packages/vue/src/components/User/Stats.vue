<template>
  <div>
    <h2>Stats!</h2>
    One day: {{ scheduledReviews[0] }}
    <br />
    Seven day: {{ scheduledReviews[1] }}
    <br />
    Thirty Day: {{ scheduledReviews[2] }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { log } from 'util';
import confetti from 'canvas-confetti';
import { User } from '@/db/userDB';

export default defineComponent({
  name: 'Stats',

  props: {
    _id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      u: null as User | null,
      confetti: this.$store.state.config.likesConfetti as boolean,
      darkMode: this.$store.state.config.darkMode as boolean,
      scheduledReviews: [] as number[],
    };
  },

  computed: {
    isNewUser(): boolean {
      return this.$route.path.endsWith('new');
    },
  },

  methods: {
    updateDark(): void {
      this.u?.setConfig({
        darkMode: this.darkMode,
      });
      this.$store.state.config.darkMode = this.darkMode;
    },

    updateConfetti(): void {
      console.log(`Confetti updated...`);
      this.u?.setConfig({
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
    },
  },

  async created() {
    this.$data.u = await User.instance();
    [1, 7, 30].forEach(async (d) => {
      this.scheduledReviews.push((await this.u!.getReviewsForcast(d)).length);
    });
  },
});
</script>

<style scoped></style>

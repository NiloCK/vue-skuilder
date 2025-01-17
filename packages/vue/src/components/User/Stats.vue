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
import { log } from '@/logshim';
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
      scheduledReviews: [] as number[],
    };
  },

  computed: {
    isNewUser(): boolean {
      return this.$route.path.endsWith('new');
    },
  },

  async created() {
    this.u = await User.instance();
    [1, 7, 30].forEach(async (d) => {
      this.scheduledReviews.push((await this.u!.getReviewsForcast(d)).length);
    });
  },
});
</script>

<style scoped></style>

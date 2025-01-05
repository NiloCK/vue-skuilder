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
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { log } from 'util';
import SkldrVue from '../../SkldrVue';
import confetti from 'canvas-confetti';

@Component({})
export default class User extends Vue {
  @Prop({
    required: true,
  })
  public _id: string;
  private u = this.$store.state._user!;

  public confetti: boolean = this.$store.state.config.likesConfetti;
  public darkMode: boolean = this.$store.state.config.darkMode;

  public scheduledReviews: number[] = [];

  updateDark() {
    this.u.setConfig({
      darkMode: this.darkMode,
    });
    this.$store.state.config.darkMode = this.darkMode;
  }

  updateConfetti() {
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

  public get isNewUser(): boolean {
    return this.$route.path.endsWith('new');
  }

  async created() {
    [1, 7, 30].forEach(async (d) => {
      this.scheduledReviews.push((await this.u.getReviewsForcast(d)).length);
    });
  }
}
</script>

<style scoped></style>

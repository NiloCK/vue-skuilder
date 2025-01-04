<template>
  <div>
    <h2>Stats!</h2>
    One day: {{ scheduledReviews[0] }}
    <br>
    Seven day: {{ scheduledReviews[1] }}
    <br>
    Thirty Day: {{ scheduledReviews[2] }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onCreated } from 'vue';
import { useStore } from 'vuex';
import confetti from 'canvas-confetti';
import { useRoute } from 'vue-router';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'User',
  
  props: {
    _id: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const route = useRoute();
    const { log } = SkldrComposable();
    
    const u = store.state._user!;
    const scheduledReviews = ref<number[]>([]);
    const confettiEnabled = ref(store.state.config.likesConfetti);
    const darkMode = ref(store.state.config.darkMode);

    const updateDark = () => {
      u.setConfig({
        darkMode: darkMode.value
      });
      store.state.config.darkMode = darkMode.value;
    };

    const updateConfetti = () => {
      log('Confetti updated...');
      u.setConfig({
        likesConfetti: confettiEnabled.value
      });
      store.state.config.likesConfetti = confettiEnabled.value;

      if (store.state.config.likesConfetti) {
        confetti({
          origin: {
            x: 0.5,
            y: 1
          }
        });
      }
    };

    const isNewUser = computed(() => {
      return route.path.endsWith('new');
    });

    onCreated(async () => {
      for (const d of [1, 7, 30]) {
        scheduledReviews.value.push(
          (await u.getReviewsForcast(d)).length
        );
      }
    });

    return {
      scheduledReviews,
      confettiEnabled,
      darkMode,
      updateDark,
      updateConfetti,
      isNewUser
    };
  }
});
</script>

<style scoped></style>

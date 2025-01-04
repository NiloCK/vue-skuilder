<template>
  <transition appear name="fade" mode="out-in">
    <a @click="next()" v-for="(t, i) in text" v-if="i === index" :key="i">{{ text[index] }}</a>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TextSwap',
  
  props: {
    text: {
      type: Array as () => string[],
      required: true,
    }
  },

  setup(props) {
    const index = ref(0);

    const next = () => {
      if (props.text.length > 1) {
        const previous = index.value;
        while (index.value === previous) {
          index.value = Math.floor(Math.random() * props.text.length);
        }
      }
    };

    return {
      index,
      next
    };
  }
});
</script>

<style scoped>
a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #aaa;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
  text-underline-position: below;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

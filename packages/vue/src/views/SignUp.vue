<template>
  <v-container class="d-flex align-center maxWidth">
    <user-registration />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserRegistration from '@/components/UserRegistration.vue';

export default defineComponent({
  name: 'LoginRoute',

  components: {
    UserRegistration,
  },
});
</script>

<style lang="css" scoped>
.maxWidth {
  max-width: 650px;
}
</style>

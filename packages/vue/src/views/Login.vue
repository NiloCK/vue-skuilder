<template>
  <v-container class="d-flex align-center login">
    <user-login />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserLogin from '@/components/UserLogin.vue';
import SkldrMixin from '@/mixins/SkldrVueMixin';

export default defineComponent({
  name: 'LoginRoute',

  components: {
    UserLogin,
  },

  // Extending SkldrVue functionality
  mixins: [SkldrMixin],
});
</script>

<style lang="css" scoped>
.login {
  max-width: 650px;
}
</style>

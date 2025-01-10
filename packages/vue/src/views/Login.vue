<template>
  <v-container grid-list-xs align-center class="login">
    <user-login />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import UserLogin from '@/components/UserLogin.vue';
import SkldrMixin from '@/mixins/SkldrVueMixin';

export default Vue.extend({
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

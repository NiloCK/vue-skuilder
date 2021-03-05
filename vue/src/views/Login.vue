<template>
  <v-container grid-list-xs align-center class="login">
    <user-login />
  </v-container>
</template>

<script lang="ts">
import UserLogin from '@/components/UserLogin.vue';
import { SkldrRoute } from '@/SkldrRoute';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  components: {
    UserLogin,
  },
})
export default class LoginRoute extends SkldrRoute {}
</script>

<style lang="css" scoped>
.login {
  max-width: 650px;
}
</style>

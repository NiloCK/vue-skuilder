<template>
  <transition v-if="userReady && display" name="component-fade" mode="out-in">
    <div v-if="guestMode">
      <v-dialog v-model="regDialog" width="500px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mr-2" small color="success" v-bind="attrs" v-on="on">Sign Up</v-btn>
        </template>
        <UserRegistration @toggle="toggle" />
      </v-dialog>
      <v-dialog v-model="loginDialog" width="500px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn small color="success" v-bind="attrs" v-on="on">Log In</v-btn>
        </template>
        <UserLogin @toggle="toggle" />
      </v-dialog>
    </div>
    <user-chip v-else />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserLogin from './UserLogin.vue';
import UserRegistration from './UserRegistration.vue';
import UserChip from './UserChip.vue';
import { User } from '../db/userDB';
import { useAuthStore, GuestUsername } from '@/stores/useAuthStore';

export default defineComponent({
  name: 'UserLoginAndRegistrationContainer',

  components: {
    UserLogin,
    UserRegistration,
    UserChip,
  },

  data() {
    return {
      GuestUsername,
      authStore: useAuthStore(),
    };
  },

  computed: {
    display(): boolean {
      if (
        (this.$route.name && this.$route.name.toLowerCase() === 'login') ||
        (this.$route.name && this.$route.name.toLowerCase() === 'signup')
      ) {
        return false;
      } else {
        return true;
      }
    },

    userReady(): boolean {
      return this.authStore.onLoadComplete;
    },

    guestMode(): boolean {
      if (this.authStore._user) {
        return this.authStore._user.username.startsWith(this.GuestUsername);
      } else {
        return !this.authStore.loginAndRegistration.loggedIn;
      }
    },

    regDialog: {
      get(): boolean {
        return this.authStore.loginAndRegistration.regDialogOpen;
      },
      set(value: boolean) {
        this.authStore.loginAndRegistration.regDialogOpen = value;
      },
    },

    loginDialog: {
      get(): boolean {
        return this.authStore.loginAndRegistration.loginDialogOpen;
      },
      set(value: boolean) {
        this.authStore.loginAndRegistration.loginDialogOpen = value;
      },
    },
  },

  methods: {
    toggle(): void {
      if (this.regDialog && this.loginDialog) {
        throw new Error(`
Registration / Login dialogs both activated.
`);
      } else if (this.regDialog === this.loginDialog) {
        throw new Error(`
Registration / Login dialogs toggled while both were dormant.
`);
      } else {
        this.regDialog = !this.regDialog;
        this.loginDialog = !this.loginDialog;
      }
    },
  },
});
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.5s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

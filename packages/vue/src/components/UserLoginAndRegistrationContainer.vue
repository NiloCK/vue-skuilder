<template>
  <transition v-if="$store.state._user && display" name="component-fade" mode="out-in">
    <div v-if="guestMode">
      <v-dialog v-model="regDialog" width="500px" lazy>
        <v-btn small slot="activator" color="success"> Sign Up </v-btn>
        <UserRegistration @toggle="toggle" />
      </v-dialog>
      <v-dialog lazy v-model="loginDialog" width="500px">
        <v-btn small slot="activator" color="success"> Log In </v-btn>
        <UserLogin @toggle="toggle" />
      </v-dialog>
    </div>
    <user-chip v-else />
  </transition>
</template>

<script lang="ts">
import UserLogin from './UserLogin.vue';
import UserRegistration from './UserRegistration.vue';
import Component from 'vue-class-component';
import UserChip from './UserChip.vue';
import { GuestUsername } from '@/store';
import SkldrVue from '../SkldrVue';
import { User } from '../db/userDB';

@Component({
  components: {
    UserLogin,
    UserRegistration,
    UserChip,
  },
})
export default class UserLoginAndRegistrationContainer extends SkldrVue {
  private readonly GuestUsername: string = GuestUsername;

  private get display(): boolean {
    if (
      (this.$route.name && this.$route.name.toLowerCase() === 'login') ||
      (this.$route.name && this.$route.name.toLowerCase() === 'signup')
    ) {
      return false;
    } else {
      return true;
    }
  }

  private get guestMode(): boolean {
    if (this.$store.state._user) {
      return this.$store.state._user.username.startsWith(GuestUsername);
    } else {
      return !this.$store.state.userLoginAndRegistrationContainer.loggedIn;
    }
  }

  private get regDialog(): boolean {
    return this.$store.state.userLoginAndRegistrationContainer.regDialogOpen;
  }
  private set regDialog(value: boolean) {
    this.$store.state.userLoginAndRegistrationContainer.regDialogOpen = value;
  }

  private get loginDialog(): boolean {
    return this.$store.state.userLoginAndRegistrationContainer.loginDialogOpen;
  }
  private set loginDialog(value: boolean) {
    this.$store.state.userLoginAndRegistrationContainer.loginDialogOpen = value;
  }

  private toggle() {
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
  }
}
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

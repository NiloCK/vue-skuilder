<template>
<transition name="component-fade" mode="out-in">
    <div v-if="$store.state.user !== ''">
        <div v-if="$store.state.user === GuestUsername">
            <v-dialog
                v-model="registrationDialog"
                width="500px"
                lazy
            >
                <v-btn
                    small
                    slot="activator"
                    color="success"
                >
                    Sign Up
                </v-btn>
                <UserRegistration @toggle="toggle" />
            </v-dialog>
            <v-dialog
            lazy
            v-model="loginDialog"
            width="500"
            >
                <v-btn
                    small
                    slot="activator"
                    color="success"
                >
                    Log In
                </v-btn>
                <UserLogin @toggle="toggle" />
            </v-dialog>
        </div>
        <user-chip v-else/>
    </div>
</transition>
</template>

<script lang="ts">
import Vue from 'vue';
import UserLogin from './UserLogin.vue';
import UserRegistration from './UserRegistration.vue';
import Component from 'vue-class-component';
import UserChip from './UserChip.vue';
import { GuestUsername } from '@/store';

@Component({
  components: {
    UserLogin,
    UserRegistration,
    UserChip
  }
})
export default class UserLoginAndRegistrationContainer extends Vue {
  private readonly GuestUsername: string = GuestUsername;

  private registrationDialog: boolean = false;
  private loginDialog: boolean = false;

  private toggle() {
    if (this.registrationDialog && this.loginDialog) {
      throw new Error(`
Registration / Login dialogs both activated.
`);
    } else if (this.registrationDialog === this.loginDialog) {
      throw new Error(`
Registration / Login dialogs toggled while both were dormant.
`);
    } else {
      this.registrationDialog = !this.registrationDialog;
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

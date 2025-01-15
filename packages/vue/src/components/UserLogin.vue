<template>
  <v-card>
    <v-card-title v-if="!loginRoute" class="text-h5 grey lighten-2">Log In</v-card-title>

    <v-card-text>
      <v-form onsubmit="return false;">
        <v-text-field
          autofocus
          name="name"
          label="Username"
          id=""
          v-model="username"
          prepend-icon="mdi-account-circle"
        ></v-text-field>
        <v-text-field
          prepend-icon="mdi-lock"
          name="name"
          hover="Show password input"
          label="Enter your password"
          hint=""
          min="0"
          :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="() => (passwordVisible = !passwordVisible)"
          :type="passwordVisible ? 'text' : 'password'"
          v-model="password"
        ></v-text-field>

        <v-snackbar v-model="badLoginAttempt" bottom right :timeout="errorTimeout">
          Username or password was incorrect.
          <v-btn color="pink" text @click="badLoginAttempt = false">Close</v-btn>
        </v-snackbar>

        <v-btn class="mr-2" type="submit" :loading="awaitingResponse" @click="login" :color="buttonStatus.color">
          <v-icon left>mdi-lock-open</v-icon>
          Log In
        </v-btn>
        <router-link v-if="loginRoute" to="signup">
          <v-btn text>Create New Account</v-btn>
        </router-link>
        <v-btn v-else text @click="toggle">Create New Account</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { alertUser } from '@/components/SnackbarService.vue';
import { log } from 'util';
import { AppState } from '@/store';
import { Status } from '@/enums/Status';
import { User } from '@/db/userDB';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConfigStore } from '@/stores/useConfigStore';

export default defineComponent({
  name: 'UserLogin',

  data() {
    return {
      username: '',
      password: '',
      retypedPassword: '',
      passwordVisible: false,
      awaitingResponse: false,
      badLoginAttempt: false,
      errorTimeout: 5000,
      user: undefined as User | undefined,
      authStore: useAuthStore(),
      configStore: useConfigStore(),
    };
  },

  computed: {
    loginRoute(): boolean {
      return this.$router.currentRoute.name! === 'login';
    },

    buttonStatus() {
      return {
        color: this.badLoginAttempt ? 'error' : 'success',
        text: this.badLoginAttempt ? 'Try again' : 'Log In',
      };
    },
  },

  methods: {
    initBadLogin() {
      this.badLoginAttempt = true;
      alertUser({
        text: 'Username or password was incorrect.',
        status: Status.error,
        timeout: this.errorTimeout,
      });
      setTimeout(() => {
        this.badLoginAttempt = false;
      }, this.errorTimeout);
    },

    async login() {
      this.awaitingResponse = true;

      try {
        // #172 starting point - why is the pre-existing _user being referenced here?
        this.user = await User.instance();
        const res = await this.user.login(this.username, this.password);

        // load user config
        this.configStore.init();

        // set login state
        this.authStore.loginAndRegistration.loggedIn = true;
        this.$router.push('/study');
      } catch (e) {
        // entry #186
        console.log(`login error: ${e}`);
        // - differentiate response
        // - return better message to UI
        this.initBadLogin();
      }

      this.awaitingResponse = false;
    },

    toggle() {
      log('Toggling registration / login forms.');
      this.$emit('toggle');
    },
  },
});
</script>

<style lang="css" scoped>
.login {
  max-width: 650px;
}
</style>

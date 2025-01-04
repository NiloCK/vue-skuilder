<template>
  <!-- <v-container grid-list-xs align-center class='login'> -->

  <v-row align="center">
    <v-col>
      <v-card>
        <v-card-title v-if="!loginRoute" class="headline grey lighten-2" primary-title> Log In </v-card-title>

        <v-card-text>
          <v-form onsubmit="return false;">
            <v-text-field
              autofocus
              name="name"
              label="Username"
              id=""
              v-model="username"
              prepend-icon="account_circle"
            ></v-text-field>
            <v-text-field
              prepend-icon="lock"
              name="name"
              hover="Show password input"
              label="Enter your password"
              hint=""
              min="0"
              :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
              @click:append="() => (passwordVisible = !passwordVisible)"
              :type="passwordVisible ? 'text' : 'password'"
              v-model="password"
            ></v-text-field>
            <v-btn class="mr-2" type="submit" :loading="awaitingResponse" @click="login" :color="buttonStatus.color">
              <v-icon left dark>lock_open</v-icon>
              Log In
            </v-btn>
            <router-link v-if="loginRoute" to="signup">
              <v-btn text>Create New Account</v-btn>
            </router-link>
            <v-btn v-else @click="toggle" text> Create New Account </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <!-- </v-container> -->
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import type { AppState } from '@/store';

export default defineComponent({
  name: 'UserLogin',
  
  setup(props, { emit }) {
    const store = useStore<AppState>();
    const router = useRouter();
    const { log } = SkldrComposable();

    const username = ref('');
    const password = ref('');
    const retypedPassword = ref('');
    const passwordVisible = ref(false);
    const awaitingResponse = ref(false);
    const badLoginAttempt = ref(false);
    const errorTimeout = 5000;

    const loginRoute = computed(() => router.currentRoute.value.name === 'login');

    const buttonStatus = computed(() => ({
      color: badLoginAttempt.value ? 'error' : 'success',
      text: badLoginAttempt.value ? 'Try again' : 'Log In'
    }));

    const initBadLogin = () => {
      badLoginAttempt.value = true;
      alertUser({
        text: 'Username or password was incorrect.',
        status: Status.error,
        timeout: errorTimeout
      });
      setTimeout(() => {
        badLoginAttempt.value = false;
      }, errorTimeout);
    };

    const login = async () => {
      awaitingResponse.value = true;

      try {
        const res = await store.state._user!.login(username.value, password.value);
        store.state._user!.getConfig().then((cfg) => {
          store.state.config = cfg;
        });
        store.state.userLoginAndRegistrationContainer.loggedIn = true;
        router.push('/study');
      } catch (e) {
        log(`login error: ${e}`);
        initBadLogin();
      }

      awaitingResponse.value = false;
    };

    const toggle = () => {
      console.log('Toggling registration / login forms.');
      emit('toggle');
    };

    return {
      username,
      password,
      retypedPassword,
      passwordVisible,
      awaitingResponse,
      loginRoute,
      buttonStatus,
      login,
      toggle
    };
  }
});
</script>

<style lang="css" scoped>
.login {
  max-width: 650px;
}
</style>

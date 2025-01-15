<template>
  <v-card>
    <v-card-title v-if="!registrationRoute" class="text-h5 grey lighten-2"> Create an Account </v-card-title>

    <v-card-text>
      <v-form onsubmit="return false;">
        <v-text-field
          ref="userNameTextField"
          @blur="validateUsername"
          autofocus
          name="name"
          label="Choose a Username"
          id=""
          v-model="username"
          prepend-icon="mdi-account-circle"
          :error="usernameError"
          :hint="usernameHint"
        ></v-text-field>
        <v-text-field
          prepend-icon="mdi-lock"
          name="name"
          hover="Show password"
          label="Create a password"
          hint=""
          min="4"
          :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="() => (passwordVisible = !passwordVisible)"
          :type="passwordVisible ? 'text' : 'password'"
          v-model="password"
        ></v-text-field>
        <v-text-field
          prepend-icon="mdi-lock"
          name="name"
          hover="Show password"
          label="Retype your password"
          hint=""
          min="4"
          :type="passwordVisible ? 'text' : 'password'"
          v-model="retypedPassword"
        ></v-text-field>

        <!-- <v-checkbox label="Student" v-model="student" ></v-checkbox>
            <v-checkbox label="Teacher" v-model="teacher" ></v-checkbox>
            <v-checkbox label="Author" v-model="author" ></v-checkbox> -->

        <v-snackbar v-model="badLoginAttempt" bottom right :timeout="5000">
          Username or password was incorrect.
          <v-btn color="pink" text @click="badLoginAttempt = false"> Close </v-btn>
        </v-snackbar>
        <v-btn class="mr-2" type="submit" :loading="awaitingResponse" @click="createUser" :color="buttonStatus.color">
          <v-icon left>mdi-lock-open</v-icon>
          Create Account
        </v-btn>
        <router-link v-if="registrationRoute" to="login">
          <v-btn text>Log In</v-btn>
        </router-link>
        <v-btn v-else text @click="toggle"> Log In </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { doesUserExist, User } from '@/db/userDB';
import { log } from 'util';
import { alertUser } from './SnackbarService.vue';
import { Status } from '../enums/Status';
import { useAuthStore } from '@/stores/useAuthStore';

export default defineComponent({
  name: 'UserRegistration',

  data() {
    return {
      username: '',
      password: '',
      retypedPassword: '',
      passwordVisible: false,
      usernameValidationInProgress: false,
      usernameError: false,
      usernameHint: '',
      awaitingResponse: false,
      badLoginAttempt: false,
      userSecret: '',
      secret: 'goons',
      user: null as User | null,
      roles: ['Student', 'Teacher', 'Author'] as string[],
      student: true,
      teacher: false,
      author: false,
      authStore: useAuthStore(),
    };
  },

  computed: {
    registrationRoute(): boolean {
      return typeof this.$route.name === 'string' && this.$route.name.toLowerCase() === 'signup';
    },
    buttonStatus() {
      return {
        color: this.badLoginAttempt ? 'error' : 'success',
        text: this.badLoginAttempt ? 'Try again' : 'Log In',
      };
    },
  },

  async created() {
    this.user = await User.instance();
  },

  methods: {
    toggle() {
      log('Toggling registration / login forms.');
      this.$emit('toggle');
    },

    validateUsername() {
      this.usernameError = false;
    },

    async createUser() {
      this.awaitingResponse = true;
      log(`
User creation
-------------

Name: ${this.username}
Student: ${this.student}
Teacher: ${this.teacher}
Author: ${this.author}
`);
      if (true) {
        if (this.password === this.retypedPassword) {
          if (!this.user) return;

          this.user
            .createAccount(this.username, this.password)
            .then(async (resp) => {
              if (resp.status === Status.ok) {
                this.authStore.loginAndRegistration.loggedIn = true;
                this.authStore.loginAndRegistration.init = false;
                this.authStore.loginAndRegistration.init = true;

                this.$router.push(`/u/${(await User.instance()).username}/new`);
              } else {
                if (resp.error === 'This username is taken!') {
                  this.usernameError = true;
                  this.usernameHint = 'Try a different name.';
                  (this.$refs.userNameTextField as HTMLInputElement).focus();
                  alertUser({
                    text: `The name ${this.username} is taken!`,
                    status: resp.status,
                  });
                } else {
                  alertUser({
                    text: resp.error,
                    status: resp.status,
                  });
                }
              }
            })
            .catch((e) => {
              if (e)
                alertUser({
                  text: JSON.stringify(e),
                  status: Status.error,
                });
            });
        } else {
          alertUser({
            text: 'Passwords do not match',
            status: Status.error,
          });
        }
        this.awaitingResponse = false;
      } else {
        alertUser({
          text: 'Secret join code is not correct.',
          status: Status.error,
        });
        this.awaitingResponse = false;
      }
    },
  },
});
</script>

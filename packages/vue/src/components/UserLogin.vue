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
import Vue from 'vue';
import Component from 'vue-class-component';
import { alertUser } from '@/components/SnackbarService.vue';
import { log } from 'util';
import { AppState } from '@/store';
import { Emit } from 'vue-property-decorator';
import { Status } from '@/enums/Status';

@Component({})
export default class UserLogin extends Vue {
  private username: string = '';
  private password: string = '';
  private retypedPassword: string = '';
  private passwordVisible: boolean = false;

  private awaitingResponse: boolean = false;
  private badLoginAttempt: boolean = false;
  private readonly errorTimeout: number = 5000;
  private get loginRoute(): boolean {
    return this.$router.currentRoute.name! === 'login';
  }

  private initBadLogin() {
    this.badLoginAttempt = true;
    alertUser({
      text: 'Username or password was incorrect.',
      status: Status.error,
      timeout: this.errorTimeout,
    });
    setTimeout(() => {
      this.badLoginAttempt = false;
    }, this.errorTimeout);
  }

  private async login() {
    this.awaitingResponse = true;

    try {
      // #172 starting point - why is the pre-existing _user being referenced here?
      const res = await this.$store.state._user!.login(this.username, this.password);
      this.$store.state._user!.getConfig().then((cfg) => {
        this.$store.state.config = cfg;
      });
      this.$store.state.userLoginAndRegistrationContainer.loggedIn = true;
      this.$router.push('/study');
    } catch (e) {
      // entry #186
      console.log(`login error: ${e}`);
      // - differentiate response
      // - return better message to UI
      this.initBadLogin();
    }

    this.awaitingResponse = false;
  }

  private get buttonStatus() {
    return {
      color: this.badLoginAttempt ? 'error' : 'success',
      text: this.badLoginAttempt ? 'Try again' : 'Log In',
    };
  }

  @Emit() // tslint:disable-next-line:no-empty
  private toggle() {
    log('Toggling registration / login forms.');
  }
}
</script>

<style lang="css" scoped>
.login {
  max-width: 650px;
}
</style>

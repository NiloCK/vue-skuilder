<template>
    <v-card>
        <v-card-title
            v-if="!registrationRoute"
            class="headline grey lighten-2"
            primary-title
        >
          Create an Account
        </v-card-title>

        <v-card-text>
        <v-form
            onsubmit="return false;"
        >
              <v-text-field
                  ref="userNameTextField"
                  @blur="validateUsername"
                  autofocus
                  name="name"
                  label="Choose a Username"
                  id=""
                  v-model="username"
                  prepend-icon="account_circle"
                  :error="usernameError"
                  :hint="usernameHint"
              ></v-text-field>
              <v-text-field
                  prepend-icon="lock"
                  name="name"
                  hover="Show password"
                  label="Create a password"
                  hint=""
                  min="4"
                  :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
                  @click:append="() => (passwordVisible = !passwordVisible)"
                  :type="passwordVisible ? 'text' : 'password'"
                  v-model="password"
              ></v-text-field>
              <v-text-field
                  prepend-icon="lock"
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

            <v-snackbar
                v-model="badLoginAttempt"
                bottom
                right
                :timeout="5000"
            >
                Username or password was incorrect.
                <v-btn
                    color="pink"
                    flat
                    @click="badLoginAttempt = false"
                >
                    Close
                </v-btn>
            </v-snackbar>
            <v-btn type="submit" :loading="awaitingResponse" @click="createUser" :color="buttonStatus.color">
                <v-icon left dark>lock_open</v-icon>
                Create Account
            </v-btn>
            <router-link
              v-if="registrationRoute"
              to="login"
            >
              <v-btn flat>Log In</v-btn>
            </router-link>
            <v-btn
             v-else
             flat
             @click="toggle"
            >
                Log In
            </v-btn>        
        </v-form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { doesUserExist, User } from '@/db/userDB';
import { log } from 'util';
import { AppState } from '@/store';
import { Emit } from 'vue-property-decorator';
import { alertUser } from './SnackbarService.vue';
import { Status } from '../enums/Status';
import SkldrVue from '../SkldrVue';

@Component({})
export default class UserRegistration extends SkldrVue {
  public $refs: {
    userNameTextField: HTMLInputElement;
  };

  private username: string = '';
  private password: string = '';
  private retypedPassword: string = '';
  private passwordVisible: boolean = false;

  private usernameValidationInProgress: boolean = false;
  private usernameError: boolean = false;
  private usernameHint: string = '';
  private awaitingResponse: boolean = false;
  private badLoginAttempt: boolean = false;

  private userSecret: string = '';
  private secret: string = 'goons';
  private get registrationRoute(): boolean {
    return this.$route.name!.toLowerCase() === 'signup';
  }

  private readonly roles: string[] = [
    'Student',
    'Teacher',
    'Author'
  ];

  private readonly student: boolean = true;
  private teacher: any = false;
  private author: any = false;

  private get buttonStatus() {
    return {
      color: this.badLoginAttempt ? 'error' : 'success',
      text: this.badLoginAttempt ? 'Try again' : 'Log In'
    };
  }

  @Emit() // tslint:disable-next-line:no-empty
  private toggle() {
    log('Toggling registration / login forms.');
  }

  private validateUsername() {
    // empty code block! to do...?...!
    this.usernameError = false;
  }

  private async createUser() {
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
        this.$store.state._user!.createAccount(this.username, this.password).then(async (resp) => {
          if (resp.status === Status.ok) {

            this.$store.state.userLoginAndRegistrationContainer.loggedIn = true;
            this.$store.state.userLoginAndRegistrationContainer.init = false;
            this.$store.state.userLoginAndRegistrationContainer.init = true;

            this.$router.push(`/u/${(await User.instance()).username}/new`);
          } else {
            if (resp.error === "This username is taken!") {
              this.usernameError = true;
              this.usernameHint = "Try a different name.";
              this.$refs.userNameTextField.focus();
              alertUser({
                text: `The name ${this.username} is taken!`,
                status: resp.status
              });
            } else {
              alertUser({
                text: resp.error,
                status: resp.status
              });
            }
          }
        }).catch((e) => {
          if (e)
            alertUser({
              text: JSON.stringify(e),
              status: Status.error
            });
        });
      } else {
        alertUser({
          text: 'Passwords do not match',
          status: Status.error
        });
      }
      this.awaitingResponse = false;
      // this.$router.push('/quilts');
    } else {
      alertUser({
        text: 'Secret join code is not correct.',
        status: Status.error
      });
      this.awaitingResponse = false;
    }
  }
}
</script>

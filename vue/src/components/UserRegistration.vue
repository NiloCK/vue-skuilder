<template>
    <v-card>
        <v-card-title
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
            <v-btn @click="toggle" flat >
                Log In
            </v-btn>        
        </v-form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  remoteDBLogin,
  remoteDBSignup,
  doesUserExist,
  remoteDBLogout
} from '@/db';
import { log } from 'util';
import { AppState } from '@/store';
import { Emit } from 'vue-property-decorator';
import { alertUser } from './SnackbarService.vue';
import { Status } from '../enums/Status';
import SkldrVue from '../SkldrVue';

@Component({})
export default class UserRegistration extends SkldrVue {
  public $refs: {
    userNameTextField: any
  };

  private username: string = '';
  private password: string = '';
  private retypedPassword: string = '';
  private passwordVisible: boolean = false;

  private usernameValidationInProgress: boolean = false;
  private awaitingResponse: boolean = false;
  private badLoginAttempt: boolean = false;

  private userSecret: string = '';
  private secret: string = 'goons';

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
        //     await remoteDBLogout();
        //     const options: PouchDB.Authentication.PutUserOptions = {};
        //     // couchdb objects at non-admin creation of 'roles'
        //     // will need a different approach here
        //     options.roles = [];
        //     if (this.student) { options.roles.push('student'); }
        //     if (this.author) { options.roles.push('author'); }
        //     if (this.teacher) { options.roles.push('teacher'); }

        //     remoteDBSignup(this.username, this.password, options).
        //       then((resp) => {
        //         if (resp.ok) {
        //           log(`User ${this.username} created`);
        //           remoteDBLogin(this.username, this.password);
        //           this.$store.state.user = this.username;
        //         }
        //       }).catch((err) => {
        //         log(`User ${this.username} NOT created:
        // ${JSON.stringify(err)}`);
        //       });
        await this.$store.state._user!.createAccount(this.username, this.password)
        this.$store.state.userLoginAndRegistrationContainer = {
          ...this.$store.state.userLoginAndRegistrationContainer,
          loggedIn: true
        }
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

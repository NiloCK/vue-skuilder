<template>
    <v-card>
        <v-card-title
            class="headline grey lighten-2"
            primary-title
        >
          Create Account
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
                min="4"
                :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
                :append-icon-cb="() => (passwordVisible = !passwordVisible)"
                :type="passwordVisible ? 'text' : 'password'"
                v-model="password"
            ></v-text-field>
            <v-text-field
                prepend-icon="lock"
                name="name"
                hover="Show password input"
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
import { remoteDBLogin, remoteDBSignup, doesUserExist, getUserDB } from '@/db';
import { log } from 'util';
import { AppState } from '@/store';
import { Emit } from 'vue-property-decorator';

@Component({})
export default class UserRegistration extends Vue {
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
    this.usernameValidationInProgress = true;
    this.$refs.userNameTextField.loading = true;

    try {
      getUserDB(this.username).allDocs();
    } catch (e) {
      alert('no userdb!');
    }

    doesUserExist(this.username).then((exists) => {
      if (exists) {
        log('name is taken :(');
        this.$refs.userNameTextField.error = true;
      } else {
        log('name is available');
        this.$refs.userNameTextField.appendIcon = 'done';
      }
      this.usernameValidationInProgress = false;
    });
    this.$refs.userNameTextField.loading = false;
  }

  private createUser() {
    this.awaitingResponse = true;
    log(`
User creation
-------------

Name: ${this.username}
Student: ${this.student}
Teacher: ${this.teacher}
Author: ${this.author}
`);

    if (this.password === this.retypedPassword) {
      const options: PouchDB.Authentication.PutUserOptions = {};
      // couchdb objects at non-admin creation of 'roles'
      // will need a different approach here
      options.roles = [];
      if (this.student) { options.roles.push('student'); }
      if (this.author) { options.roles.push('author'); }
      if (this.teacher) { options.roles.push('teacher'); }

      remoteDBSignup(this.username, this.password, options).
        then((resp) => {
          if (resp.ok) {
            log(`User ${this.username} created`);
            this.$store.state.user = this.username;
          }
        });
    } else {
      alert('Passwords do not match');
    }
    this.awaitingResponse = false;
  }
}
</script>

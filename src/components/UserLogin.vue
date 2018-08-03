<template>
    <div>
        <v-typography class="display-1">
            Log in:
        </v-typography>
        <v-text-field
            name="name"
            label="Username:"
            id=""
            v-model="username"
        ></v-text-field>
        <br>
        <v-text-field
            name="name"
            label="Enter your password"
            hint=""
            min="0"
            :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
            :append-icon-cb="() => (passwordVisible = !passwordVisible)"
            :type="passwordVisible ? 'text' : 'password'"
            v-model="password"
        ></v-text-field>
        <br>
        <div v-if='newUserMode'>
            Retype Password: <input type="password" name="" id="" v-model="retypedPassword" />
        </div>
        <v-btn @click="login" color="success">Log In / Register</v-btn>
        <!-- <button @click="login">Log In / Register</button> -->
        <br>
        <a @click="newUserMode = !newUserMode">(Sign up)</a>

    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { remoteDBLogin, remoteDBSignup } from '@/db';
import { log } from 'util';
import { AppState } from '@/store';

@Component({})
export default class UserLogin extends Vue {
    private username: string = '';
    private password: string = '';
    private retypedPassword: string = '';
    private passwordVisible: boolean = false;

    private newUserMode: boolean = false;

    private login() {
        if (this.newUserMode) {
            this.createUser();
        } else {
            remoteDBLogin(this.username, this.password).
                then((resp) => {
                    log('Logged in: ' + resp.ok);
                    this.$store.state.user = this.username;
                });
        }
    }

    private createUser() {
        if (this.password === this.retypedPassword) {
            remoteDBSignup(this.username, this.password).
                then((resp) => {
                    if (resp.ok) {
                        log(`User ${this.username} created`);
                        this.$store.state.user = this.username;
                    }
                });
        } else {
            alert('Passwords do not match');
        }
    }
}
</script>

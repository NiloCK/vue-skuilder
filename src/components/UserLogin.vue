<template>
    <v-card>
        <v-card-title
            class="headline grey lighten-2"
            primary-title
        >
            Log In
        </v-card-title>

        <v-card-text>
        <v-form
            onsubmit="return false;"  
        >
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
                :append-icon-cb="() => (passwordVisible = !passwordVisible)"
                :type="passwordVisible ? 'text' : 'password'"
                v-model="password"
            ></v-text-field>
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
            <v-btn type="submit" :loading="awaitingResponse" @click="login" :color="buttonStatus.color">
                <v-icon left dark>lock_open</v-icon>
                Log In
            </v-btn>
            <v-btn @click="toggle" flat >
                Create New Account
            </v-btn>        
        </v-form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { remoteDBLogin, remoteDBSignup } from '@/db';
import { log } from 'util';
import { AppState } from '@/store';
import { Emit } from 'vue-property-decorator';

@Component({})
export default class UserLogin extends Vue {
    private username: string = '';
    private password: string = '';
    private retypedPassword: string = '';
    private passwordVisible: boolean = false;

    private awaitingResponse: boolean = false;
    private badLoginAttempt: boolean = false;

    private login() {
        this.awaitingResponse = true;
        remoteDBLogin(this.username, this.password).
            then((resp) => {
                if (resp.ok) {
                    this.$store.state.user = this.username;
                } else {
                    this.badLoginAttempt = true;
                }
                log('Logged in: ' + resp.ok);
            }).catch((err) => {
                this.badLoginAttempt = true;
            });
        this.awaitingResponse = false;
    }

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
}
</script>

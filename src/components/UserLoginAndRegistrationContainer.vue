<template>
    <div>
        <div v-if="$store.state.user === 'Guest'">
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
        <v-chip v-else>
            <v-avatar class='primary'>
            <v-icon dark>school</v-icon>
            </v-avatar>
            {{ $store.state.user }}
        </v-chip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UserLogin from './UserLogin.vue';
import UserRegistration from './UserRegistration.vue';
import Component from 'vue-class-component';

@Component({
    components: {
        UserLogin,
        UserRegistration
    }
})
export default class UserLoginAndRegistrationContainer extends Vue {
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

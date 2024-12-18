<template>
  <v-app v-if="storeIsReady" :dark="dark">
    <!-- class="blue darken-2 grey--text text--lighten-5" dark> -->
    <v-navigation-drawer clipped v-model="drawer" enable-resize-watcher fixed app>
      <v-list>
        <v-list-tile value="true" :to="{ path: '/home' }">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title> Home </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="true" value="true" :to="{ path: '/study' }">
          <v-list-tile-action>
            <v-icon>school</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title> Study </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="true" value="true" :to="{ path: '/classrooms' }">
          <v-list-tile-action>
            <v-icon>people</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title> Classrooms </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="true" value="true" :to="{ path: '/quilts' }">
          <v-list-tile-action>
            <v-icon>bookmarks</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title> Quilts </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- <v-list-tile
          v-if='true'
          value="true"
          :to="{path: '/edit'}"
        >
          <v-list-tile-action>
            <v-icon>add_to_queue</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Edit
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile> -->
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app dense clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <!-- <v-toolbar-title class="text-uppercase">
        <span class="font-weight-thin grey--text text--darken-1">edu</span>
        <span class="grey--text text--darken-2">Quilt</span>
      </v-toolbar-title> -->
      <v-spacer></v-spacer>
      <user-login-and-registration-container />
    </v-toolbar>
    <v-content>
      <v-container>
        <v-slide-y-transition mode="out-in">
          <router-view v-if="$store.state._user" />
        </v-slide-y-transition>
      </v-container>
    </v-content>
    <!-- <v-footer fixed app>
      <span>
       v: <router-link to='/notes'>{{build}}</router-link>
      </span>
    </v-footer> -->
    <snackbar-service id="SnackbarService" />
  </v-app>
</template>

<script lang="ts">
import UserLoginAndRegistrationContainer from '@/components/UserLoginAndRegistrationContainer.vue';
import SnackbarService from '@/components/SnackbarService.vue';
import { getLatestVersion } from '@/db';
import SkldrVue from './SkldrVue';
import Component from 'vue-class-component';

@Component({
  components: {
    UserLoginAndRegistrationContainer,
    SnackbarService,
  },
})
export default class App extends SkldrVue {
  public build: string = '0.0.2';
  public latestBuild: string = '';
  public drawer: boolean = false;

  public get dark() {
    return this.$store.state.config.darkMode; // User.config.darkMode
  }

  beforeCreate() {
    console.log('1. beforeCreate:', {
      hasStore: !!this.$store,
      hasVuex: !!(this.$store && this.$store.state),
    });
  }

  async created() {
    console.log('2. created:', {
      hasStore: !!this.$store,
      stateExists: !!(this.$store && this.$store.state),
      onLoadComplete: !!this.$store?.state?.onLoadComplete,
      user: this.$store?.state?._user,
    });
    this.latestBuild = await getLatestVersion();
  }

  mounted() {
    console.log('4. mounted:', {
      storeState: {
        onLoadComplete: this.$store?.state?.onLoadComplete,
        userInit: this.$store?.state?.userLoginAndRegistrationContainer?.init,
        loggedIn: this.$store?.state?.userLoginAndRegistrationContainer?.loggedIn,
      },
    });
  }

  get storeIsReady(): boolean {
    const ready = !!(this.$store && this.$store.state && this.$store.state.onLoadComplete);
    console.log('storeIsReady check:', {
      hasStore: !!this.$store,
      hasState: !!(this.$store && this.$store.state),
      onLoadComplete: !!(this.$store && this.$store.state && this.$store.state.onLoadComplete),
      ready,
    });
    return ready;
  }
}
</script>

<style>
code:before,
code:after {
  content: none !important;
}
</style>

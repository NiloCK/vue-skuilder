<template>
  <v-app v-if="$store.state.onLoadComplete" :dark="dark">
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

  async created() {
    this.latestBuild = await getLatestVersion();
  }
}
</script>

<style>
code:before,
code:after {
  content: none !important;
}
</style>

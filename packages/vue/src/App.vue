<template>
  <v-app v-if="storeIsReady">
    <!-- class="blue darken-2 grey--text text--lighten-5" dark> -->
    <v-navigation-drawer clipped v-model="drawer" enable-resize-watcher fixed app>
      <v-list>
        <v-list-item value="true" :to="{ path: '/home' }">
          <v-list-item-action>
            <v-icon>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Home </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="true" value="true" :to="{ path: '/study' }">
          <v-list-item-action>
            <v-icon>school</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Study </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="true" value="true" :to="{ path: '/classrooms' }">
          <v-list-item-action>
            <v-icon>people</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Classrooms </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="true" value="true" :to="{ path: '/quilts' }">
          <v-list-item-action>
            <v-icon>bookmarks</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Quilts </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- <v-list-item
          v-if='true'
          value="true"
          :to="{path: '/edit'}"
        >
          <v-list-item-action>
            <v-icon>add_to_queue</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              Edit
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app dense clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <!-- <v-toolbar-title class="text-uppercase">
        <span class="font-weight-thin grey--text text--darken-1">edu</span>
        <span class="grey--text text--darken-2">Quilt</span>
      </v-toolbar-title> -->
      <v-spacer></v-spacer>
      <user-login-and-registration-container />
    </v-app-bar>
    <v-main>
      <v-container>
        <v-slide-y-transition mode="out-in">
          <router-view />
        </v-slide-y-transition>
      </v-container>
    </v-main>
    <!-- <v-footer fixed app>
      <span>
       v: <router-link to='/notes'>{{build}}</router-link>
      </span>
    </v-footer> -->
    <snackbar-service id="SnackbarService" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import UserLoginAndRegistrationContainer from '@/components/UserLoginAndRegistrationContainer.vue';
import SnackbarService from '@/components/SnackbarService.vue';
import { getLatestVersion } from '@/db';
import SkldrVueMixin from './mixins/SkldrVueMixin';
import { useConfigStore } from '@/stores/useConfigStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { mapState } from 'pinia';

export default Vue.extend({
  name: 'App',
  mixins: [SkldrVueMixin],

  components: {
    UserLoginAndRegistrationContainer,
    SnackbarService,
  },

  data() {
    return {
      build: '0.0.2',
      latestBuild: '',
      drawer: false,
      authStore: useAuthStore(),
    };
  },

  computed: {
    dark() {
      const configStore = useConfigStore();
      const dm = configStore.config.darkMode;
      return configStore.config.darkMode;
    },

    ...mapState(useAuthStore, {
      storeIsReady: (state) => state.onLoadComplete,
    }),
  },

  watch: {
    dark: {
      immediate: true,
      handler(newVal) {
        // This is how we properly toggle Vuetify's dark mode
        this.$vuetify.theme.dark = newVal;
      },
    },
  },

  async beforeCreate() {
    // hydrate all (some?) pinia stores
    const configStore = useConfigStore();
    let i = await configStore.init();

    const authStore = useAuthStore();
    await authStore.init();

    console.log('1. beforeCreate:', {
      hasStore: !!this.$store,
      hasVuex: !!(this.$store && this.$store.state),
    });
  },

  async created() {
    this.latestBuild = await getLatestVersion();
  },
});
</script>

<style>
code:before,
code:after {
  content: none !important;
}
</style>

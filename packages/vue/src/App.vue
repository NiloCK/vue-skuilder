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

<script lang="ts" setup>
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import UserLoginAndRegistrationContainer from '@/components/UserLoginAndRegistrationContainer.vue';
import SnackbarService from '@/components/SnackbarService.vue';
import { getLatestVersion } from '@/db';
import { useConfigStore } from '@/stores/useConfigStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'App',
});

const build = ref('0.0.2');
const latestBuild = ref('');
const drawer = ref(false);
const authStore = useAuthStore();
const configStore = useConfigStore();
const theme = useTheme();

const { onLoadComplete: storeIsReady } = storeToRefs(authStore);

const dark = computed(() => {
  return configStore.config.darkMode;
});

watch(
  dark,
  newVal => {
    theme.global.name.value = newVal ? 'dark' : 'light';
  },
  { immediate: true }
);

onBeforeMount(async () => {
  await configStore.init();
  await authStore.init();
});

onMounted(async () => {
  latestBuild.value = await getLatestVersion();
});
</script>

<style>
code:before,
code:after {
  content: none !important;
}
</style>

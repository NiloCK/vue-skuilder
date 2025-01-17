<template>
  <v-app v-if="storeIsReady">
    <v-navigation-drawer v-model="drawer" :elevation="2" permanent expand-on-hover>
      <v-list>
        <v-list-item to="/home" value="home">
          <template #prepend>
            <v-icon icon="mdi-home"></v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="true" to="/study" value="study">
          <template #prepend>
            <v-icon icon="mdi-school"></v-icon>
          </template>
          <v-list-item-title>Study</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="true" to="/classrooms" value="classrooms">
          <template #prepend>
            <v-icon icon="mdi-account-group"></v-icon>
          </template>
          <v-list-item-title>Classrooms</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="true" to="/quilts" value="quilts">
          <template #prepend>
            <v-icon icon="mdi-bookmark-multiple"></v-icon>
          </template>
          <v-list-item-title>Quilts</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <user-login-and-registration-container />
    </v-app-bar>

    <v-main>
      <v-container>
        <v-fade-transition mode="out-in">
          <router-view />
        </v-fade-transition>
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
  (newVal) => {
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

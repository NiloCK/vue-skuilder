<template>
  <v-badge :content="items.length" :model-value="hasNewItems" color="accent" overlap>
    <v-menu offset-y transition="scale-transition">
      <template #activator="{ props }">
        <v-chip v-bind="props" class="ma-2">
          <v-avatar start class="bg-primary">
            <v-icon dark>mdi-school</v-icon>
          </v-avatar>
          {{ username }}
        </v-chip>
      </template>

      <v-list>
        <v-list-item v-for="item in items" :key="item" @click="dismiss(item)">
          <v-list-item-title>{{ item }}</v-list-item-title>
        </v-list-item>

        <v-divider v-if="items.length" />

        <v-list-item @click="gotoStats">
          <v-list-item-icon>
            <v-icon>mdi-trending-up</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Stats</v-list-item-title>
        </v-list-item>

        <v-list-item @click="gotoSettings">
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Log out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-badge>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { log } from '@/logshim';
import { setTimeout } from 'timers';
import { User } from '../db/userDB';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConfigStore } from '@/stores/useConfigStore';

export default defineComponent({
  name: 'UserChip',

  data() {
    return {
      username: '',
      items: [] as string[],
      checked: false,
      authStore: useAuthStore(),
      configStore: useConfigStore(),
    };
  },

  computed: {
    hasNewItems(): boolean {
      return this.items.length > 0;
    },
  },

  created() {
    User.instance().then((u) => {
      this.username = u.username;
    });
  },

  methods: {
    async gotoSettings() {
      this.$router.push(`/u/${(await User.instance()).username}`);
    },

    async gotoStats() {
      this.$router.push(`/u/${(await User.instance()).username}/stats`);
    },

    dismiss(item: string) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
    },

    async logout() {
      const res = await this.authStore._user!.logout();
      if (res.ok) {
        this.authStore.loginAndRegistration = {
          init: true,
          loggedIn: false,
          regDialogOpen: false,
          loginDialogOpen: false,
        };

        this.configStore.resetDefaults();

        this.$router.push('/home');
      }
    },
  },
});
</script>

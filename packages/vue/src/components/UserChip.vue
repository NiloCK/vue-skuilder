<template>
  <v-badge :content="items.length" :value="hasNewItems" color="accent" overlap>
    <v-menu offset-y transition="scale-transition">
      <template v-slot:activator="{ on, attrs }">
        <v-chip v-bind="attrs" v-on="on" class="ma-2">
          <v-avatar left class="primary">
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
import Vue from 'vue';
import Component from 'vue-class-component';
import { log } from 'util';
import { setTimeout } from 'timers';
import { User } from '../db/userDB';

@Component({})
export default class UserChip extends Vue {
  private username: string = '';
  private items: string[] = [
    // 'sample1', 'sample2', 'sample3', 'sample4'
  ];

  private checked: boolean = false;
  created() {
    User.instance().then((u) => {
      this.username = u.username;
    });
  }
  public async gotoSettings() {
    this.$router.push(`/u/${(await User.instance()).username}`);
  }
  public async gotoStats() {
    this.$router.push(`/u/${(await User.instance()).username}/stats`);
  }

  private dismiss(item: string) {
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
  }
  private async logout() {
    const res = await this.$store.state._user!.logout();
    if (res.ok) {
      this.$store.state.userLoginAndRegistrationContainer = {
        init: true,
        loggedIn: false,
        regDialogOpen: false,
        loginDialogOpen: false,
      };

      this.$store.state.config.darkMode = false;
      this.$store.state.config.likesConfetti = false;

      this.$router.push('/home');
    }
  }

  public get hasNewItems(): boolean {
    return this.items.length > 0;
  }
}
</script>

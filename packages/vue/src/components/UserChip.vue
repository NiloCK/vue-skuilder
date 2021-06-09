<template>
  <v-badge overlap color="accent" v-model="hasNewItems">
    <span slot="badge" dark small>{{ items.length }}</span>

    <v-menu offset-y transition="scale-transition">
      <v-chip slot="activator">
        <v-avatar class="primary">
          <v-icon dark>school</v-icon>
        </v-avatar>
        {{ username }}
      </v-chip>

      <v-list>
        <!-- eventual notifications bar -->
        <v-list-tile v-for="item in items" :key="item.key" @click="dismiss(item)">
          <v-list-tile-title>{{ item }}</v-list-tile-title>
        </v-list-tile>

        <v-divider v-if="items.length" />

        <v-list-tile @click="gotoStats">
          <v-icon left>trending_up</v-icon>
          <v-list-tile-title>Stats</v-list-tile-title>
        </v-list-tile>

        <v-list-tile @click="gotoSettings">
          <v-icon left>settings</v-icon>
          <v-list-tile-title>Settings</v-list-tile-title>
        </v-list-tile>

        <v-list-tile @click="logout">
          <v-icon left>launch</v-icon>
          <v-list-tile-title>Log out</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-badge>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { log } from 'util';
import { setTimeout } from 'timers';
import SkldrVue from '../SkldrVue';
import { User } from '../db/userDB';

@Component({})
export default class UserChip extends SkldrVue {
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

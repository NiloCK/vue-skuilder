<template>
  <v-badge overlap color="accent" v-model="hasNewItems">
    <template v-slot:badge>
      <span dark small>{{ items.length }}</span>
    </template>

    <v-menu offset-y transition="scale-transition">
      <template v-slot:activator="{ on, attrs }">
        <v-chip v-bind="attrs" v-on="on">
          <v-avatar class="primary">
            <v-icon dark>school</v-icon>
          </v-avatar>
          {{ username }}
        </v-chip>
      </template>

      <v-list>
        <!-- eventual notifications bar -->
        <v-list-item v-for="item in items" :key="item" @click="dismiss(item)">
          <v-list-item-title>{{ item }}</v-list-item-title>
        </v-list-item>

        <v-divider v-if="items.length" />

        <v-list-item @click="gotoStats">
          <v-icon left>trending_up</v-icon>
          <v-list-item-title>Stats</v-list-item-title>
        </v-list-item>

        <v-list-item @click="gotoSettings">
          <v-icon left>settings</v-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
          <v-icon left>launch</v-icon>
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
import Vue from 'vue';
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

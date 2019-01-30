<template>
  <v-badge
      overlap
      color="accent"
      v-model="hasNewItems"
    >
      <span
        slot="badge"
        dark
        small
      >{{items.length}}</span>
      
      <v-menu
        offset-y
        transition="scale-transition"
      >
        <v-chip
        slot="activator"
        >
                <v-avatar class='primary'>
                <v-icon dark>school</v-icon>
                </v-avatar>
                {{ $store.state.user }}
        </v-chip>
        
        <v-list>
          <v-list-tile v-for="item in items" :key="item.key" @click="dismiss(item)">
            <v-list-tile-title>{{ item }}</v-list-tile-title>
          </v-list-tile>
          <v-divider />
          <v-list-tile @click="logout">
            <v-list-tile-title>Log out</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-badge>
</template>


<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { remoteDBLogout } from '@/db';
import { GuestUsername } from '@/store';
import { log } from 'util';
import { setTimeout } from 'timers';

@Component({})
export default class UserChip extends Vue {
  private items: string[] = [
    'sample1', 'sample2', 'sample3', 'sample4'
  ];

  private checked: boolean = false;

  private dismiss(item: string) {
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
  }
  private logout() {
    remoteDBLogout().then((res) => {
      if (res.ok) {
        log(`Logged out: ${res}`);
        this.$store.state.user = '';
        this.$store.state.userLoginAndRegistrationContainer = {
          loggedIn: false,
          regDialogOpen: false,
          loginDialogOpen: false
        }
        setTimeout(() => {
          this.$store.state.user = GuestUsername;
        }, 1000);
      }
    });
  }

  public get hasNewItems(): boolean {
    return this.items.length > 0;
  }
}
</script>

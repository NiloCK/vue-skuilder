<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :to="{path: '/' + item.title.toLowerCase()}"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title">
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>remove</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <user-login-and-registration-container />
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
<v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
      <router-view/>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
    </v-content>
    
    <v-navigation-drawer
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile @click="right = !right">
          <v-list-tile-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
    <snackbar-service id="SnackbarService" />
  </v-app>
</template>

<script lang="ts">
import UserLoginAndRegistrationContainer from '@/components/UserLoginAndRegistrationContainer.vue';
import SnackbarService from '@/components/SnackbarService.vue';

export default {
  name: 'App',
  components: {
    UserLoginAndRegistrationContainer,
    SnackbarService
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        {
          icon: 'home',
          title: 'Home'
        },
        {
          icon: 'school',
          title: 'Study'
        },
        {
          icon: 'add_to_queue',
          title: 'Edit'
        },
        {
          icon: 'group',
          title: 'Classrooms'
        },
        {
          icon: 'book',
          title: 'Courses'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Skuilder'
    };
  }
};
</script>

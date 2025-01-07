<template>
  <v-dialog max-width="500px" transition="dialog-transition" v-if="display">
    <template v-slot:activator="{ on, attrs }">
      <v-btn fab dark color="primary" v-bind="attrs" v-on="on">
        <v-icon dark>keyboard</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-toolbar color="teal" dark>
        <v-toolbar-title>Shortcut keys for this card:</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-list>
        <v-list-item v-for="hk in commands" :key="hk.hotkey">
          <v-btn outlined color="black">
            {{ hk.hotkey }}
          </v-btn>
          <v-spacer></v-spacer>
          <span class="text-right">
            {{ hk.command }}
          </span>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SkldrMouseTrap, { HotKeyMetaData } from '../SkldrMouseTrap';

export default defineComponent({
  name: 'SkldrControlsView',
  
  data() {
    return {
      commands: [] as HotKeyMetaData[],
      display: false
    };
  },

  created() {
    setInterval(this.refreshState, 500);
  },

  methods: {
    refreshState() {
      // console.log(`this.display: ${this.display}`);
      this.commands = SkldrMouseTrap.commands;
      this.display = this.commands.length > 0;
    }
  }
});
</script>

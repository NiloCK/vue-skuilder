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
import { defineComponent, ref, onCreated } from 'vue';
import SkldrMouseTrap, { HotKeyMetaData } from '../SkldrMouseTrap';
import { SkldrComposable } from '@/mixins/SkldrComposable';

export default defineComponent({
  name: 'SkldrControlsView',
  
  setup() {
    const { log } = SkldrComposable();
    const commands = ref<HotKeyMetaData[]>([]);
    const display = ref(false);

    const refreshState = () => {
      commands.value = SkldrMouseTrap.commands;
      display.value = commands.value.length > 0;
    };

    onCreated(() => {
      setInterval(refreshState, 500);
    });

    return {
      commands,
      display
    };
  }
});
</script>

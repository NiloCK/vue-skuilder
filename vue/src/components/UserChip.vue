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
        </v-list>
      </v-menu>
    </v-badge>
</template>


<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class UserChip extends Vue {
  private items: string[] = [
    'asof', ' awefaweftizv', 'twfzvitwef', 'asof'
  ];

  private checked: boolean = false;

  private dismiss(item: string) {
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
  }

  public get hasNewItems(): boolean {
    return this.items.length > 0;
  }
}
</script>

<template>
  <div>
    <v-snackbar
      v-for="snack in snacks"
      :key="snacks.indexOf(snack)"
      v-model="show[snacks.indexOf(snack)]"
      :timeout="snack.timeout"
      bottom
      right
      :color="getColor(snack)"
    >
      {{ snack.text }}
      <v-btn icon flat @click="close()">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Status } from '@/enums/Status';
import { Prop, Watch } from 'vue-property-decorator';
import { watch } from 'fs';
import { log } from 'util';

interface SnackbarOptions {
  text: string;
  status: Status;
  timeout?: number;
}

export function alertUser(msg: SnackbarOptions): void {
  const snackBarService: SnackbarService = (document.getElementById('SnackbarService')! as any)
    .__vue__ as SnackbarService;

  msg = {
    text: msg.text,
    status: msg.status,
    timeout: msg.timeout !== undefined ? msg.timeout : 5000, // 5000 ms default
  };

  snackBarService.addSnack(msg);
}

@Component
export default class SnackbarService extends Vue {
  /**
   * A history of snacks served in this session.
   *
   * Possible future work: write these to localstorage/pouchdb
   * for persistance
   */
  private snacks: SnackbarOptions[] = [];
  private show: boolean[] = [];

  public addSnack(snack: SnackbarOptions) {
    this.snacks.push(snack);
    this.show.push(true);
  }

  private close() {
    this.show.pop();
    this.show.push(false);
  }

  private getColor(snack: SnackbarOptions) {
    if (snack.status === Status.ok) {
      return 'success';
    } else if (snack.status === Status.error) {
      return 'error';
    } else if (snack.status === Status.warning) {
      return 'yellow';
    }
  }
}
</script>

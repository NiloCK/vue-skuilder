<template>
  <v-snackbar
      v-model="show"
      :timeout="currentSnack.timeout"
      bottom
      right
  >
    {{ currentSnack.text }}
    <v-btn
      color="pink"
      flat
      @click="show = false"
    >
      Close
    </v-btn>
  </v-snackbar>
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
  const snackBarService: SnackbarService =
    (document.getElementById('SnackbarService')! as any).__vue__ as SnackbarService;

  msg = {
    text: msg.text,
    status: msg.status,
    timeout: msg.timeout !== undefined ? msg.timeout : 5000 // 5000 ms default
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
  private show: boolean = false;
  private currentSnack: SnackbarOptions = {
    text: '',
    status: Status.ok
  };

  public addSnack(snack: SnackbarOptions) {
    this.snacks.push(snack);
    this.currentSnack = snack;
    this.show = true;
  }
}
</script>

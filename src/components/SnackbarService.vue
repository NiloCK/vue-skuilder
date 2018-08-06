<template>
  <v-snackbar
    v-model="show"
    :timeout="options.timeout"
    bottom
    right
  >
    {{ options.text }}
    

    <v-btn
        color="pink"
        flat
        @click="snackbar = false"
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

interface SnackbarOptions {
  text: string;
  status: Status;
  timeout?: number;
}

@Component
export default class SnackbarService extends Vue {
  public static addSnack(options: SnackbarOptions) {
    options = {
      text: options.text,
      status: options.status,
      timeout: options.timeout !== undefined ? options.timeout : 5000
    };

    // get singleton instance of snackbar service
    const service: SnackbarService =
      (document.getElementById('SnackbarService')! as any) as SnackbarService;

    // // update the props
    service.options = options;
    service.show = true;
    service.$forceUpdate();
    // const snack = new SnackbarService();
    // snack.options = options;

  }

  @Prop({
    default: () => {
      return {
        text: 'This is some text',
        status: Status.ok,
        timeout: 5000
      };
    }
  }) private options: SnackbarOptions;
  private show: boolean = true;

  public created() {
    if (this.$store.state.snack) {
      this.options = this.$store.state.snack;
    }
  }

  @Watch('$store.state.snack')
  public update() {
    if (this.$store.state.snack) {
      this.options = this.$store.state.snack;
    }
  }


  /**
   * A history of snacks served in this session.
   *
   * Possible future work: write these to localstorage/pouchdb
   * for persistance
   */
  // private snacks: SnackbarOptions[] = [];

  private clearSnack() {
    this.$store.state.snack = {};
    delete this.$store.state.snack;
    this.show = false;
  }
}
</script>

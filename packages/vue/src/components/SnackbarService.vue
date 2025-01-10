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
      <v-btn icon text @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Status } from '@/enums/Status';

interface SnackbarOptions {
  text: string;
  status: Status;
  timeout?: number;
}

export function alertUser(msg: SnackbarOptions): void {
  const snackBarService = (document.getElementById('SnackbarService')! as any)
    .__vue__ as InstanceType<typeof SnackbarService>;

  msg = {
    text: msg.text,
    status: msg.status,
    timeout: msg.timeout !== undefined ? msg.timeout : 5000, // 5000 ms default
  };

  snackBarService.addSnack(msg);
}

const SnackbarService = defineComponent({
  name: 'SnackbarService',

  data() {
    return {
      /**
       * A history of snacks served in this session.
       *
       * Possible future work: write these to localstorage/pouchdb
       * for persistance
       */
      snacks: [] as SnackbarOptions[],
      show: [] as boolean[]
    };
  },

  methods: {
    addSnack(snack: SnackbarOptions): void {
      this.snacks.push(snack);
      this.show.push(true);
    },

    close(): void {
      this.show.pop();
      this.show.push(false);
    },

    getColor(snack: SnackbarOptions): string | undefined {
      if (snack.status === Status.ok) {
        return 'success';
      } else if (snack.status === Status.error) {
        return 'error';
      } else if (snack.status === Status.warning) {
        return 'yellow';
      }
      return undefined;
    }
  }
});

export default SnackbarService;
</script>

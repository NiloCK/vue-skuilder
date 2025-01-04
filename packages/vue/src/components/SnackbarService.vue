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
import { ref } from 'vue';
import { Status } from '@/enums/Status';

interface SnackbarOptions {
  text: string;
  status: Status;
  timeout?: number;
}

// State
const snacks = ref<SnackbarOptions[]>([]);
const show = ref<boolean[]>([]);

// Methods
const addSnack = (snack: SnackbarOptions) => {
  snacks.value.push(snack);
  show.value.push(true);
};

const close = () => {
  show.value.pop();
  show.value.push(false);
};

const getColor = (snack: SnackbarOptions): string => {
  if (snack.status === Status.ok) {
    return 'success';
  } else if (snack.status === Status.error) {
    return 'error';
  } else if (snack.status === Status.warning) {
    return 'yellow';
  }
  return ''; // default fallback
};

// External utility function
export function alertUser(msg: SnackbarOptions): void {
  const snackBarService = (document.getElementById('SnackbarService')! as any)
    .__vue__;

  msg = {
    text: msg.text,
    status: msg.status,
    timeout: msg.timeout !== undefined ? msg.timeout : 5000, // 5000 ms default
  };

  snackBarService.addSnack(msg);
}

// Expose methods for template and external access
defineExpose({
  addSnack
});
</script>

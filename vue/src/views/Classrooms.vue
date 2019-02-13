<template>
  <div>
    <v-btn @click="createClass">Create a classroom</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { createClass } from '@/server/index';

@Component({
  components: {
  }
})
export default class Classroom extends Vue {
  private async createClass() {
    const status = await createClass();

    // alert(status);
  }
}
</script>

<template>
  <div>
    <v-btn @click="createClass">Create a classroom</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import serverRequest from '@/server/index';
import { ServerRequestType } from '@/server/types';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';
import { log } from 'util';


@Component({
  components: {
  }
})
export default class Classroom extends SkldrVue {
  private async createClass() {
    const status = await serverRequest({
      type: ServerRequestType.CREATE_CLASSROOM,
      className: 'hi',
      user: this.$store.state.user
    });

    log(status.responseText);

    alertUser({
      text: 'Class Created',
      status: Status.ok
    });
  }
}
</script>

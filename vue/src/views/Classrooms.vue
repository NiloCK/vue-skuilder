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
  public classes: string[] = [];

  public beforeRouteEnter(to: any, from: any, next: () => {}) {
    // todo ?
    // See https://router.vuejs.org/guide/advanced/data-fetching.html#fetching-before-navigation
  }

  private async deleteClass(classId: string) {
    const result = await serverRequest({
      type: ServerRequestType.DELETE_CLASSROOM,
      user: this.$store.state.user,
      classID: classId,
      response: null
    });


  }

  private async createClass() {
    const status = await serverRequest({
      type: ServerRequestType.CREATE_CLASSROOM,
      className: 'hi',
      user: this.$store.state.user,
      response: null
    });

    alertUser({
      text: `Class ${JSON.stringify(status)} Created`,
      status: Status.ok
    });
  }
}
</script>

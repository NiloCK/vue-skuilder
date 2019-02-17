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


@Component({
  components: {
  }
})
export default class Classroom extends Vue {
  private async createClass() {
    const status = await serverRequest({
      type: ServerRequestType.CREATE_CLASSROOM,
      className: 'hi',
      user: 'test'
    });
  }
}
</script>

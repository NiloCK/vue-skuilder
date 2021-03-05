<template>
  <v-container grid-list-xs align-center class="maxWidth">
    <user-registration />
  </v-container>
</template>

<script lang="ts">
import UserRegistration from '@/components/UserRegistration.vue';
import SkldrVue from '@/SkldrVue';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  components: {
    UserRegistration,
  },
})
export default class LoginRoute extends SkldrVue {}
</script>

<style lang="css" scoped>
.maxWidth {
  max-width: 650px;
}
</style>

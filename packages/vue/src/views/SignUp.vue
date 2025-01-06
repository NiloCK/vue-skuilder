<template>
  <v-container grid-list-xs align-center class="maxWidth">
    <user-registration />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import UserRegistration from '@/components/UserRegistration.vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default Vue.extend({
  name: 'LoginRoute',

  components: {
    UserRegistration,
  },

  mixins: [SkldrVueMixin],
});
</script>

<style lang="css" scoped>
.maxWidth {
  max-width: 650px;
}
</style>

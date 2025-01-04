<template>
  <div>
    <table>
      <thead>
        <td></td>
      </thead>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';

export default Vue.extend({
  name: 'UnregisteredComponentsTable',
  mixins: [SkldrVueMixin],
});
</script>

<template>
  <div>
    Hi
    <v-btn>Create a classroom</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';

@Component({
  components: {
  }
})
export default class Classroom extends Vue {
  public test: string = 'hello';
}
</script>

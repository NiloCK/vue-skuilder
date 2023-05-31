<template>
  <div id="abc"></div>
</template>

<script lang="ts">
import abc from 'abcjs';
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class MusicScoreRenderer extends Vue {
  @Prop() public abcString: string;

  public mounted() {
    abc.renderAbc('abc', this.abcString);
  }
}
</script>

<style>
#abc {
  width: 100%;
  height: 100%;
}
</style>

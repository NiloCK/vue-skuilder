<template>
    <div>
        <button v-on:click='decrementView'>Previous View</button>
        {{ views[viewIndex].name }}
        <button v-on:click='incrementView'>Next View</button>
        <br><br>
        <CardViewer :view='views[viewIndex]' :data='data' />
        <br><br>
        This is a <b>{{views[viewIndex].name}}</b> component, with the following data: {{JSON.stringify(data)}}
    </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';
import Vue from 'vue';
import Viewable from '@/base-course/Viewable';
import CardViewer from '@/components/Study/CardViewer.vue';

@Component({
    components: {
        CardViewer
    }
})
export default class CardBrowser extends Vue {
  @Prop() public views: Array<VueConstructor<Viewable>>;
  @Prop() public data: DisplayableData;
  public viewIndex: number = 0;

  private incrementView() {
      this.viewIndex++;
      this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
  }
  private decrementView() {
      this.viewIndex--;
      this.viewIndex = (this.viewIndex + this.views.length) % this.views.length;
  }
}
</script>

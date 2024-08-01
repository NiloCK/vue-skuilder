<template>
  <div class="cal-heatmap-wrapper">
    <div ref="calHeatmap" id="hm"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
// import 'cal-heatmap/cal-heatmap.css';
import CalHeatmap from 'cal-heatmap';

@Component
export default class HeatMap extends Vue {
  @Prop({ type: Object, required: true }) data!: { [key: string]: number };
  @Prop({ type: String, default: 'day' }) subDomain!: string;
  @Prop({ type: Number, default: 12 }) range!: number;
  @Prop({ type: String, default: 'month' }) domain!: string;
  @Prop({ type: String, default: 'now' }) start!: string;

  private cal: CalHeatmap | null = null;

  mounted() {
    console.log('HMHMHM mounted');
    this.initCalHeatmap();
  }

  beforeDestroy() {
    if (this.cal) {
      this.cal.destroy();
    }
  }

  initCalHeatmap() {
    this.cal = new CalHeatmap();
    console.log('HMHMHM');
    prompt('hello');
    this.cal.fill([
      {
        date: '2012-01-01',
        value: 1,
      },
    ]);
    this.cal.paint();
    // this.cal.
    // this.cal.fill();
    this.cal.paint({
      // itemSelector: this.$refs.calHeatmap as HTMLElement,
      itemSelector: '#hm',
      // data: this.data,
      // // domain: this.domain,
      // // subDomain: this.subDomain,
      // // start: new Date(this.start),
      // range: this.range,
      // cellSize: 10,
      // cellPadding: 2,
      // domainGutter: 10,
      // legend: [2, 4, 6, 8],
      // tooltip: true,
    });
  }
}
</script>

<style scoped>
.cal-heatmap-wrapper {
  font-family: Arial, sans-serif;
}
</style>
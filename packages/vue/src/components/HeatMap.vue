<template>
  <div>
    <div v-for="[date, count] in Object.entries(heatmapData)" :key="date">
      {{ date }}: {{ count }} review{{ count > 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { CardHistory, CardRecord } from '@/db/types';
import moment from 'moment';

@Component({})
export default class HeatMap extends SkldrVue {
  heatmapData: { [key: string]: number } = {};

  async created() {
    this.log('Heatmap created');
    const history = await this.user().getHistory();

    let allHist: CardHistory<CardRecord>[] = [];
    for (let i = 0; i < history.length; i++) {
      if (history[i]) {
        allHist.push(history[i]!);
      }
    }

    this.processHistory(allHist);
  }

  processHistory(history: CardHistory<CardRecord>[]) {
    this.log(`Processing ${history.length} records`);
    const data: { [key: string]: number } = {};
    history.forEach(item => {
      if (item && item.records) {
        item.records.forEach((record: CardRecord) => {
          this.log(`Processing timestamp: ${record.timeStamp}`);
          const date = moment(record.timeStamp).format('YYYY-MM-DD');
          this.log(`parsed Data: ${date}`);
          // if (moment(date).isBetween(start, end, null, '[]')) {
          data[date] = (data[date] || 0) + 1;
          // }
        });
      }
    });
    this.heatmapData = data;
  }

  beforeDestroy() {}
}
</script>

<style scoped>
</style>
<template>
  <div>
    <svg :width="width" :height="height">
      <g
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        :transform="`translate(${weekIndex * (cellSize + cellMargin)}, 0)`"
      >
        <rect
          v-for="(day, dayIndex) in week"
          :key="day.date"
          :x="0"
          :y="dayIndex * (cellSize + cellMargin)"
          :width="cellSize"
          :height="cellSize"
          :fill="getColor(day.count)"
          @mouseover="showTooltip(day, $event)"
          @mouseout="hideTooltip"
        />
      </g>
    </svg>
    <div v-if="tooltipData" class="tooltip" :style="tooltipStyle">
      {{ tooltipData.count }} review{{ tooltipData.count !== 1 ? 's' : '' }} on {{ toDateString(tooltipData.date) }}
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SkldrVue from '@/SkldrVue';
import { CardHistory, CardRecord } from '@/db/types';
import moment from 'moment';

interface DayData {
  date: string;
  count: number;
}

interface Color {
  h: number;
  s: number;
  l: number;
}

@Component({})
export default class HeatMap extends SkldrVue {
  heatmapData: { [key: string]: number } = {};

  weeks: DayData[][] = [];
  cellSize = 12;
  cellMargin = 3;
  width = 53 * (this.cellSize + this.cellMargin);
  height = 7 * (this.cellSize + this.cellMargin);
  tooltipData: DayData | null = null;
  tooltipStyle: { [key: string]: string } = {};
  maxInRange = 0;

  inactiveColor: Color = { h: 0, s: 0, l: 0.9 };
  activeColor: Color = { h: 155, s: 1, l: 0.5 };

  toDateString(d: string): string {
    const m = moment(d);
    return moment.months()[m.month()] + ' ' + m.date();
  }

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
    this.createWeeksData();
  }

  processHistory(history: CardHistory<CardRecord>[]) {
    this.log(`Processing ${history.length} records`);
    const data: { [key: string]: number } = {};
    history.forEach(item => {
      if (item && item.records) {
        item.records.forEach((record: CardRecord) => {
          const date = moment(record.timeStamp).format('YYYY-MM-DD');
          data[date] = (data[date] || 0) + 1;
        });
      }
    });
    this.heatmapData = data;
  }

  createWeeksData() {
    const end = moment();
    const start = end.clone().subtract(52, 'weeks');
    let day = start.clone().startOf('week');

    while (day.isSameOrBefore(end)) {
      const weekData: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = day.format('YYYY-MM-DD');
        const dayData: DayData = {
          date,
          count: this.heatmapData[date] || 0,
        };
        weekData.push(dayData);
        if (dayData.count > this.maxInRange) {
          this.maxInRange = dayData.count;
        }

        day.add(1, 'day');
      }
      this.weeks.push(weekData);
    }
  }

  getColor(count: number): string {
    if (this.maxInRange === 0) return this.hslToString(this.inactiveColor);

    // avoid murky greys by using 0.5 as a floor for non-zero counts
    const t = count === 0 ? 0 : Math.min((2 * count) / this.maxInRange, 1);

    let seasonalColor: Color = this.activeColor;

    const now = moment();
    if (now.month() === 11 && now.date() >= 5) {
      // Christmas December
      seasonalColor =
        Math.random() > 0.5
          ? { h: 350, s: 0.8, l: 0.5 } // Festive red
          : { h: 135, s: 0.8, l: 0.4 }; // Festive green
    } else if (now.month() === 9 && now.date() >= 25) {
      // halloween October
      seasonalColor =
        Math.random() > 0.5
          ? { h: 0, s: 0, l: 0 } // black
          : Math.random() > 0.5
          ? { h: 30, s: 1, l: 0.5 } // orange
          : { h: 270, s: 1, l: 0.5 }; // purple
    }

    // const h = this.interpolate(this.inactiveColor.h, seasonalColor.h, t);
    const h = seasonalColor.h; // keep hue constant - only change the `pop` of the color
    const s = this.interpolate(this.inactiveColor.s, seasonalColor.s, t);
    const l = this.interpolate(this.inactiveColor.l, seasonalColor.l, t);

    return this.hslToString({ h, s, l });
  }

  private interpolate(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private hslToString(color: Color): string {
    return `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`;
  }

  showTooltip(day: DayData, event: MouseEvent) {
    this.tooltipData = day;
    this.tooltipStyle = {
      position: 'absolute',
      left: `${event.pageX + 10}px`,
      top: `${event.pageY + 10}px`,
    };
  }

  hideTooltip() {
    this.tooltipData = null;
  }
}
</script>

<style scoped>
.tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
}

/* div {
  display: flex;
  justify-content: center;
} */
</style>

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
import { defineComponent, ref, reactive, onCreated } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { CardHistory, CardRecord } from '@/db/types';
import moment from 'moment';
import { User } from '../db/userDB';

interface DayData {
  date: string;
  count: number;
}

interface Color {
  h: number;
  s: number;
  l: number;
}

export default defineComponent({
  name: 'HeatMap',
  setup() {
    const { log } = SkldrComposable();
    
    const heatmapData = reactive<{ [key: string]: number }>({});
    const weeks = ref<DayData[][]>([]);
    const cellSize = 12;
    const cellMargin = 3;
    const width = 53 * (cellSize + cellMargin);
    const height = 7 * (cellSize + cellMargin);
    const tooltipData = ref<DayData | null>(null);
    const tooltipStyle = reactive<{ [key: string]: string }>({});
    const maxInRange = ref(0);

    const inactiveColor: Color = { h: 0, s: 0, l: 0.9 };
    const activeColor: Color = { h: 155, s: 1, l: 0.5 };

    const toDateString = (d: string): string => {
      const m = moment(d);
      return moment.months()[m.month()] + ' ' + m.date();
    };

    const processHistory = (history: CardHistory<CardRecord>[]) => {
      log(`Processing ${history.length} records`);
      const data: { [key: string]: number } = {};
      history.forEach((item) => {
        if (item && item.records) {
          item.records.forEach((record: CardRecord) => {
            const date = moment(record.timeStamp).format('YYYY-MM-DD');
            data[date] = (data[date] || 0) + 1;
          });
        }
      });
      Object.assign(heatmapData, data);
    };

    const createWeeksData = () => {
      const end = moment();
      const start = end.clone().subtract(52, 'weeks');
      let day = start.clone().startOf('week');

      while (day.isSameOrBefore(end)) {
        const weekData: DayData[] = [];
        for (let i = 0; i < 7; i++) {
          const date = day.format('YYYY-MM-DD');
          const dayData: DayData = {
            date,
            count: heatmapData[date] || 0,
          };
          weekData.push(dayData);
          if (dayData.count > maxInRange.value) {
            maxInRange.value = dayData.count;
          }
          day.add(1, 'day');
        }
        weeks.value.push(weekData);
      }
    };

    const interpolate = (start: number, end: number, t: number): number => {
      return start + (end - start) * t;
    };

    const hslToString = (color: Color): string => {
      return `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`;
    };

    const getColor = (count: number): string => {
      if (maxInRange.value === 0) return hslToString(inactiveColor);

      const t = count === 0 ? 0 : Math.min((2 * count) / maxInRange.value, 1);
      let seasonalColor: Color = activeColor;

      const now = moment();
      if (now.month() === 11 && now.date() >= 5) {
        seasonalColor = Math.random() > 0.5
          ? { h: 350, s: 0.8, l: 0.5 }
          : { h: 135, s: 0.8, l: 0.4 };
      } else if (now.month() === 9 && now.date() >= 25) {
        seasonalColor = Math.random() > 0.5
          ? { h: 0, s: 0, l: 0 }
          : Math.random() > 0.5
            ? { h: 30, s: 1, l: 0.5 }
            : { h: 270, s: 1, l: 0.5 };
      }

      const h = seasonalColor.h;
      const s = interpolate(inactiveColor.s, seasonalColor.s, t);
      const l = interpolate(inactiveColor.l, seasonalColor.l, t);

      return hslToString({ h, s, l });
    };

    const showTooltip = (day: DayData, event: MouseEvent) => {
      tooltipData.value = day;
      Object.assign(tooltipStyle, {
        position: 'absolute',
        left: `${event.pageX + 10}px`,
        top: `${event.pageY + 10}px`,
      });
    };

    const hideTooltip = () => {
      tooltipData.value = null;
    };

    onCreated(async () => {
      log('Heatmap created');
      const history = await (await User.instance()).getHistory();
      let allHist: CardHistory<CardRecord>[] = [];
      for (let i = 0; i < history.length; i++) {
        if (history[i]) {
          allHist.push(history[i]!);
        }
      }
      processHistory(allHist);
      createWeeksData();
    });

    return {
      weeks,
      cellSize,
      cellMargin,
      width,
      height,
      tooltipData,
      tooltipStyle,
      toDateString,
      getColor,
      showTooltip,
      hideTooltip
    };
  }
});
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

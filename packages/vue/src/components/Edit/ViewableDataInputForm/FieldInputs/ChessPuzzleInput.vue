<template>
  <v-text-field
    ref="inputField"
    filled
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:rules="vuetifyRules()"
    v-bind:autofocus="autofocus"
    v-on:input="() => validate()"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FieldInput } from '../FieldInput';
import { toCourseElo, CourseElo } from '@/tutor/Elo';

export default defineComponent({
  name: 'ChessPuzzleInput',
  extends: FieldInput,

  mounted() {
    this.validate();
  },

  methods: {
    generateELO(): CourseElo {
      const split = (this.store[this.field.name] as string).split(',');
      const elo = parseInt(split[3]);
      const count = parseInt(split[6]);

      let crsElo: CourseElo = {
        global: {
          score: elo,
          count,
        },
        tags: {},
        misc: {},
      };

      const tags = this.generateTags();
      tags.forEach((t) => {
        crsElo.tags[t] = {
          score: elo,
          count,
        };
      });

      console.log('generateELO', JSON.stringify(crsElo));

      return crsElo;
    },

    generateTags(): string[] {
      const split = (this.store[this.field.name] as string).split(',');
      const themes = split[7].split(' ');
      const openingTags = split[9].split(' ');

      return themes.map((t) => `theme-${t}`).concat(openingTags.map((t) => `opening-${t}`));
    }
  }
});
</script>

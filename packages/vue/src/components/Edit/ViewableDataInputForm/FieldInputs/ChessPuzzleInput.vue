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
import { Component, Watch } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';
import { toCourseElo, CourseElo } from '@/tutor/Elo';

@Component
export default class ChessPuzzleInput extends FieldInput {
  /*
  From https://database.lichess.org/#puzzles

  Puzzles are formatted as standard CSV. The fields are as follows:

  PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags

  */

  public mounted() {
    this.validate();
  }

  public generateELO() {
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
  }

  public generateTags() {
    const split = (this.store[this.field.name] as string).split(',');
    const themes = split[7].split(' ');
    const openingTags = split[9].split(' ');

    return themes.map((t) => `theme-${t}`).concat(openingTags.map((t) => `opening-${t}`));
  };
}
</script>

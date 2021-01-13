<template>
    <div class="subheading">
      <div 
        v-if='isNewUser'
        class='v-alert success subheading'
       >
       <v-icon left dark>check</v-icon>
        Welcome, {{_id}}! Please take a moment to look through these settings:
      </div>

      <h1 class='display-2'>Account Settings</h1>
      <h2 class='display-1'>General:</h2>

      <v-checkbox
        label="I like confetti"
        v-model="$store.state.config.likesConfetti"
        @click.capture="updateConfetti"
      />
      <v-checkbox
        label="I like the dark"
        v-model="$store.state.config.darkMode"
      />
      <h2 class='display-1'>Languages:</h2>
      I am near-fluent or better in the following languages:
      {{ selectedLanguages.toString() }}
      <v-checkbox
        v-for="(language, i) in configLanguages"
        :key="i"
        :label="language.name"
        :value="language.code"
        v-model="selectedLanguages"
        @click.capture="updateLanguage"
      />
      <!-- <h2 class='display-1'>My Quilts:</h2>
      <div
        v-if='isNewUser'
      >

      </div> -->
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { log } from 'util';
import SkldrVue from '../SkldrVue';
import confetti from 'canvas-confetti';

@Component({})
export default class User extends SkldrVue {
  @Prop({
    required: true
  }) public _id: string;

  public confetti: boolean = false;
  public configLanguages: {
    name: string,
    code: string
  }[] = [
      {
        name: 'English',
        code: 'en'
      },
      {
        name: 'French',
        code: 'fr'
      }
    ];
  public selectedLanguages: string[] = [];

  updateConfetti() {
    console.log(`Confetti updated...`);

    if (this.$store.state.config.likesConfetti) {
      confetti({
        origin: {
          x: 0.5,
          y: 1
        }
      });
    }

  }

  public get isNewUser(): boolean {
    return this.$route.path.endsWith('new');
  }

  created() {
    this.configLanguages.forEach(l => { console.log(`afweatifvwzeatfvwzeta` + l.name) })
  }
}
</script>

<style scoped>
</style>

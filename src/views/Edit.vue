<template>
  <div>
      <h1>Editing Course Data</h1>
      <ul>
          <li v-for="item in viewables" :key="item.id">
              {{item.name}}
          </li>
      </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { getCourseQuestions } from "../db";

@Component({})
export default class Edit extends Vue {}
</script>

<template>
    <div>
      User View for {{ _id }}
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import { log } from 'util';
import SkldrVue from '../SkldrVue';

@Component({})
export default class User extends SkldrVue {
  @Prop({
    required: true
  }) public _id: string;
}
</script>

<style scoped>
</style>

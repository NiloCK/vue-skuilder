<template>
  <div>
      {{ card.Front}}
      <hr>
      {{ card.Back }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { InformationView } from '@/base-course/Viewable';
import { Displayable } from '@/base-course/Displayable';
import { FieldType } from '@/enums/FieldType';
import { DataShapeName } from '@/enums/DataShapeNames';
import { log } from 'util';
import BasicCard from './BasicCard';

// tslint:disable-next-line:max-classes-per-file
@Component
export default class BasicView extends InformationView<BasicCard> {
  public answer: string = '';

  public get displayable() {
    return new BasicCard(this.data);
  }

  public submit() {
    log('a');
  }
}
</script>

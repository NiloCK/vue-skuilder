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
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';
import { Displayable } from '@/base-course/Displayable';
import { FieldType } from '@/enums/FieldType';
import { DataShapeName } from '@/enums/DataShapeNames';

class BasicCard extends Displayable {
  public static dataShapes = [
    {
      name: DataShapeName.Basic,
      fields: [
        {
          name: 'Front',
          type: FieldType.STRING
        },
        {
          name: 'Back',
          type: FieldType.STRING
        }
      ]
    }
  ];

  public dataShapes() {
    return BasicCard.dataShapes;
  }
  public views() {
    return [
      BasicView
    ];
  }
}

// tslint:disable-next-line:max-classes-per-file
@Component({
  components: {
    UserInputNumber
  }
})
export default class BasicView extends InformationView<BasicCard> {
  public answer: string = '';

  public get displayable() {
    return new BasicCard(this.data);
  }
  public submit() { }
}
</script>

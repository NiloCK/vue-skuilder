<template>
  <div>
    {{ card.Front }}
    <hr />
    {{ card.Back }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
          type: FieldType.STRING,
        },
        {
          name: 'Back',
          type: FieldType.STRING,
        },
      ],
    },
  ];

  public dataShapes() {
    return BasicCard.dataShapes;
  }
  public views() {
    return [BasicView];
  }
}

export default defineComponent({
  name: 'BasicView',
  
  components: {
    UserInputNumber,
  },

  data() {
    return {
      answer: '',
    };
  },

  computed: {
    displayable(): BasicCard {
      return new BasicCard(this.data);
    }
  },

  methods: {
    submit(): void {
      // (no nag tslint!)
    }
  },

  extends: InformationView
});
</script>

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
import { Displayable } from '@/base-course/Displayable';
import { FieldType } from '@/enums/FieldType';
import { DataShapeName } from '@/enums/DataShapeNames';
import { log } from 'util';
import BasicCard from './BasicCard';

export default defineComponent({
  name: 'BasicCardView',
  
  extends: InformationView,

  data() {
    return {
      answer: ''
    };
  },

  computed: {
    displayable(): BasicCard {
      return new BasicCard(this.data);
    }
  },

  methods: {
    submit(): void {
      log('a');
    }
  }
});
</script>

<template>
  <div>
    {{ card.Front }}
    <hr />
    {{ card.Back }}
  </div>
</template>

<script lang="ts">
// Composition API Version
import { ref } from 'vue';
import type { InformationView } from '@/base-course/Viewable';
import type { Displayable } from '@/base-course/Displayable';
import type { FieldType } from '@/enums/FieldType';
import type { DataShapeName } from '@/enums/DataShapeNames';
import { log } from 'util';
import BasicCard from './BasicCard';

// Props would need to be inherited from InformationView
// This is a potential issue since we don't have the full InformationView implementation
defineProps<{
  data: any; // Type should match InformationView's data prop
  card: {
    Front: string;
    Back: string;
  };
}>();

const answer = ref('');

const displayable = computed(() => new BasicCard(props.data));

function submit() {
  log('a');
}
</script>

<template>
  <v-textarea
    box
    ref="inputField"
    v-model="store[field.name]"
    v-bind:name="field.name"
    v-bind:label="field.name"
    v-bind:autofocus="autofocus"
    v-on:input="validate"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SkldrVueMixin from '@/mixins/SkldrVueMixin';
import { PropType } from 'vue';
import { FieldDefinition } from '@/types';
import SimpleMDE from 'simplemde';

export default defineComponent({
  name: 'MarkdownInput',
  
  mixins: [SkldrVueMixin],
  
  props: {
    field: {
      type: Object as PropType<FieldDefinition>,
      required: true
    },
    store: {
      type: Object as PropType<Record<string, any>>,
      required: true
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    validators() {
      // Base validators would have been inherited, now need explicit implementation
      return [];
    }
  },

  mounted() {
    // Empty mounted hook preserved
  }
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css');
</style>

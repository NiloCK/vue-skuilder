<template>
  <div class="mock-environment">
    <h2>SkTagsInput Mock Environment</h2>
    <sk-tags-input
      :course-id="mockCourseId"
      :card-id="mockCardId"
      :hide-submit="false"
    />
    <hr>
    
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkTagsInput from '@/components/Edit/TagsInput.vue';

console.log(process.env.NODE_ENV);

@Component({
  components: {
    SkTagsInput,
  },
})
export default class SkTagsInputMock extends Vue {
  mockCourseId: string = 'mock-course-001';
  mockCardId: string = 'mock-card-001';
}
</script>

<style scoped>
.mock-environment {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
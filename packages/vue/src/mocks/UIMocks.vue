<template>
  <div class="mock-environment">
    <!-- <h2>DataInputForm</h2>
    <data-input-form
      :course-id="mockCourseId"
      :card-id="mockCardId"
      :hide-submit="false"
    /> -->

    <div class="component">
      <h2>MediaUploader</h2>
      <media-uploader
        :autofocus="false"
        :uiValidationFunction="() => true"
        :store="{}"
        :field="{
          name: 'MediaUploader',
          type: 'media-uploader',
          validator: {
            test: () => true,
            status: 'success',
          },
        }"
      />
    </div>

    <div class="component">
      <h2>ImageInput</h2>
      <image-input
        :autofocus="false"
        :uiValidationFunction="() => true"
        :field="{
          name: 'Image',
          type: 'image',
          validator: {
            test: () => true,
            status: 'success',
          },
        }"
        :store="{}"
      />
    </div>

    <div class="component">
      <h2>SkTagsInput</h2>
      <sk-tags-input
        :course-id="mockCourseId"
        :card-id="mockCardId"
        :hide-submit="false"
      />
    </div>
    
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SkTagsInput from '@/components/Edit/TagsInput.vue';
// import DataInputForm from '@/components/Edit/DataInputForm.vue';
import MediaUploader from '@/components/Edit/ViewableDataInputForm/FieldInputs/MediaUploader.vue';

console.log(process.env.NODE_ENV);

@Component({
  components: {
    SkTagsInput,
    // DataInputForm,
    MediaUploader,
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

.component {
  margin-bottom: 40px;
  border: #333;
  border-width: 3px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 10px;
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  text-decoration: underline;
}
</style>
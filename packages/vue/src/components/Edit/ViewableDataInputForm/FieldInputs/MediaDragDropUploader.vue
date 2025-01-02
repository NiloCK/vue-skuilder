<template>
  <div class="mr-2 mb-2">
    <v-label class="text-h5">Add media:</v-label>
    <div
      class="drop-zone"
      v-bind:class="{ 'drop-zone--over': isDragging }"
      v-on:drop="dropHandler"
      v-on:dragover.prevent="dragOverHandler"
      v-on:dragenter.prevent="dragEnterHandler"
      v-on:dragleave.prevent="dragLeaveHandler"
    >
      <input
        ref="fileInput"
        type="file"
        @change="handleFileInput"
        accept="image/*,audio/*"
        multiple
        style="display: none"
      />
      <template>
        <div v-for="(item, index) in mediaItems" :key="index" class="media-item">
          <template v-if="item.type === 'image'">
            <img :src="item.thumbnailUrl" alt="Uploaded image thumbnail" class="thumbnail" />
          </template>
          <template v-else-if="item.type === 'audio'">
            <audio controls :src="item.url"></audio>
          </template>
          <v-btn small @click="removeMedia(index)">Remove</v-btn>
        </div>
        <template>
          Drop image or audio files here...
          <v-btn @click="triggerFileInput">Or Click to Upload</v-btn>
        </template>
        <!-- <v-btn @click="addMoreMedia">Add More Media</v-btn> -->
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';

interface MediaItem {
  type: 'image' | 'audio';
  file: File;
  url: string;
  thumbnailUrl?: string;
}

type MDDURefs = FieldInput['$refs'] & {
  fileInput: HTMLInputElement;
};

@Component
export default class MediaDragDropUploader extends FieldInput {
  isDragging = false;
  mediaItems: MediaItem[] = [];

  declare $refs: MDDURefs;

  get hasMedia(): boolean {
    return this.mediaItems.length > 0;
  }

  created() {
    this.validate();
  }

  dragOverHandler(event: DragEvent) {
    event.preventDefault();
  }

  dragEnterHandler(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  dropHandler(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  triggerFileInput() {
    (this.$refs.fileInput as HTMLInputElement).click();
  }

  handleFileInput(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.processFiles(files);
    }
  }

  processFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      this.addMediaItem(file);
    });
    this.updateStore();
  }

  addMediaItem(file: File) {
    const type = file.type.startsWith('image/') ? 'image' : 'audio';
    const item: MediaItem = {
      type,
      file,
      url: URL.createObjectURL(file),
    };

    if (type === 'image') {
      this.createThumbnail(file).then((thumbnailUrl) => {
        item.thumbnailUrl = thumbnailUrl;

        // update render, because mediaItems.push() has likely already completed
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      });
    }

    this.mediaItems.push(item);
  }

  async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeMedia(index: number) {
    URL.revokeObjectURL(this.mediaItems[index].url);
    this.mediaItems.splice(index, 1);
    this.updateStore();
  }

  public clearData() {
    this.mediaItems.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });
    this.mediaItems = [];
    this.updateStore();
    // set validation to `ok` for blank input
    this.validate();
  }

  addMoreMedia() {
    this.log('addMoreMedia');
    this.triggerFileInput();
  }

  updateStore() {
    // Clear existing entries first
    for (let i = 1; i <= 10; i++) {
      this.$delete(this.store, `image-${i}`);
      this.$delete(this.store, `audio-${i}`);
    }

    // Then add current items
    let imageCount = 0;
    let audioCount = 0;
    this.mediaItems.forEach((item) => {
      if (item.type === 'image') {
        imageCount++;
        this.store[`image-${imageCount}`] = {
          content_type: item.file.type,
          data: item.file,
        };
      } else if (item.type === 'audio') {
        audioCount++;
        this.store[`audio-${audioCount}`] = {
          content_type: item.file.type,
          data: item.file,
        };
      }
    });
    this.validate();
  }

  public getValidators() {
    return [
      () => ({
        status: this.mediaItems.length > 0 ? Status.ok : Status.error,
        msg: this.mediaItems.length > 0 ? '' : 'At least one media item is required',
      }),
    ];
  }
}
</script>

<style scoped>
@import './FieldInput.css';

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.drop-zone--over {
  border-color: #000;
  background-color: rgba(0, 0, 0, 0.1);
}

.thumbnail {
  max-width: 100px;
  max-height: 100px;
  margin-right: 10px;
}

.media-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>

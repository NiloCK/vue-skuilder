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
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { FieldInput } from '../FieldInput';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';

interface MediaItem {
  type: 'image' | 'audio';
  file: File;
  url: string;
  thumbnailUrl?: string;
}

export default defineComponent({
  name: 'MediaDragDropUploader',
  extends: FieldInput,
  setup() {
    const { log } = SkldrComposable();
    const isDragging = ref(false);
    const mediaItems = ref<MediaItem[]>([]);
    const fileInput = ref<HTMLInputElement>();

    const hasMedia = computed(() => mediaItems.value.length > 0);

    const updateStore = () => {
      // Clear existing entries first
      for (let i = 1; i <= 10; i++) {
        this.$delete(this.store, `image-${i}`);
        this.$delete(this.store, `audio-${i}`);
      }

      // Then add current items
      let imageCount = 0;
      let audioCount = 0;
      mediaItems.value.forEach((item) => {
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
      validate();
    };

    const processFiles = (files: FileList) => {
      Array.from(files).forEach((file) => {
        addMediaItem(file);
      });
      updateStore();
    };

    const createThumbnail = async (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    };

    const addMediaItem = (file: File) => {
      const type = file.type.startsWith('image/') ? 'image' : 'audio';
      const item: MediaItem = {
        type,
        file,
        url: URL.createObjectURL(file),
      };

      if (type === 'image') {
        createThumbnail(file).then((thumbnailUrl) => {
          item.thumbnailUrl = thumbnailUrl;
          nextTick(() => {
            this.$forceUpdate();
          });
        });
      }

      mediaItems.value.push(item);
    };

    const removeMedia = (index: number) => {
      URL.revokeObjectURL(mediaItems.value[index].url);
      mediaItems.value.splice(index, 1);
      updateStore();
    };

    const clearData = () => {
      mediaItems.value.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
      mediaItems.value = [];
      updateStore();
      validate();
    };

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileInput = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        processFiles(files);
      }
    };

    const validate = () => ({
      status: mediaItems.value.length > 0 ? Status.ok : Status.error,
      msg: mediaItems.value.length > 0 ? '' : 'At least one media item is required',
    });

    onMounted(() => {
      validate();
    });

    return {
      isDragging,
      mediaItems,
      fileInput,
      hasMedia,
      triggerFileInput,
      handleFileInput,
      removeMedia,
      clearData,
      processFiles,
      validate,
      dragOverHandler: (event: DragEvent) => {
        event.preventDefault();
      },
      dragEnterHandler: (event: DragEvent) => {
        event.preventDefault();
        isDragging.value = true;
      },
      dragLeaveHandler: (event: DragEvent) => {
        event.preventDefault();
        isDragging.value = false;
      },
      dropHandler: (event: DragEvent) => {
        event.preventDefault();
        isDragging.value = false;
        const files = event.dataTransfer?.files;
        if (files) {
          processFiles(files);
        }
      },
    };
  },
});
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

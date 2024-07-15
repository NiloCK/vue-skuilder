<template>
  <div>
    <label v-bind:for="field.name">{{ field.name }}: </label>
    <div 
      class="drop-zone"
      :class="{ 'drop-zone--over': isDragging }"
      @drop="dropHandler"
      @dragover.prevent="dragOverHandler"
      @dragenter.prevent="dragEnterHandler"
      @dragleave.prevent="dragLeaveHandler"
    >
      <template v-if="!thumbnailUrl">
        Drop a file here...
        <input
          ref="inputField"
          v-bind:id="blobInputID"
          v-bind:name="field.name"
          @change="processInput"
          @click.stop
          type="file"
          v-bind:class="validationStatus.status"
          accept="image/*"
        />
      </template>
      <template v-else>
        <img :src="thumbnailUrl" alt="Uploaded image thumbnail" class="thumbnail" />
        <button @click="clearImage">Clear Image</button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { Component } from 'vue-property-decorator';
import { FieldInput } from '../FieldInput';

@Component
export default class ImageInput extends FieldInput {
  isDragging = false;
  private dragCounter = 0;
  thumbnailUrl: string | null = null;

  public dragOverHandler(ev: DragEvent) {
    ev.preventDefault();
  }

  public dragEnterHandler(ev: DragEvent) {
    ev.preventDefault();
    this.dragCounter++;
    this.isDragging = true;
  }

  public dragLeaveHandler(ev: DragEvent) {
    ev.preventDefault();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  public dropHandler(ev: DragEvent) {
    if (ev) {
      ev.preventDefault();

      this.isDragging = false;
      this.dragCounter = 0;

      if (ev.dataTransfer?.files.length) {
        // Handle file drop
        const file = ev.dataTransfer.files[0];
        this.processDroppedFile(file);
      } else if (ev.dataTransfer?.types.includes('text/plain') || ev.dataTransfer?.types.includes('text/uri-list')) {
        // Handle image URL drop
        const imgURL = ev.dataTransfer.getData('text');
        this.fetchImg(imgURL);
        console.log(`Dropped URL: ${imgURL}`);
      } else {
        console.warn('Unsupported drop type');
      }
    } else {
      console.warn('dropHandler triggered with no event');
    }
  }

  private processDroppedFile(file: File) {
    console.log(`
Processing dropped file:

Filename: ${file.name}
File size: ${file.size}
File type: ${file.type}
`);
    this.setData({
      content_type: file.type,
      data: file.slice(),
    } as PouchDB.Core.FullAttachment);
    this.createThumbnail(file);
    this.validate();
  }

  private async fetchImg(url: string) {
    try {
      const img = await fetch(url, {
        mode: 'no-cors',
        'content-type': 'image',
      } as any);
      const blob = await (img.body as any).blob();

      const file = new File([blob], 'dropped_image', { type: blob.type });
      this.setData({
        content_type: file.type,
        data: file.slice(),
      });
      this.createThumbnail(file);
      this.validate();
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }

  public dragHandler(ev: DragEvent) {
    console.log(`Dragging... ${JSON.stringify(ev)}`);
  }

  public getValidators(): ValidatingFunction[] {
    if (this.field.validator) {
      return [this.field.validator.test];
    } else {
      return [];
    }
  }

  private removeDragData(ev: DragEvent) {
    if (ev.dataTransfer!.items) {
      ev.dataTransfer!.items.clear();
    } else {
      ev.dataTransfer!.clearData();
    }
  }

  private get blobInputID(): string {
    return 'blobInput' + this.field.name;
  }

  private get blobInputElement(): HTMLInputElement {
    return document.getElementById(this.blobInputID) as HTMLInputElement;
  }

  private async processInput() {
    if (this.blobInputElement.files) {
      const file = this.blobInputElement.files[0];
      console.log(`
Processing input file:

Filename: ${file.name}
File size: ${file.size}
File type: ${file.type}
`);
      this.setData({
        content_type: file.type,
        data: file.slice(),
      } as PouchDB.Core.FullAttachment);
      this.createThumbnail(file);
      this.validate();
    }
  }

  private createThumbnail(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.thumbnailUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private clearImage() {
    this.thumbnailUrl = null;
    this.setData(null);
    this.validate();
    if (this.$refs.inputField) {
      (this.$refs.inputField as HTMLInputElement).value = '';
    }
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

input[type='file'] {
  box-shadow: none !important; /* uncertain where this is coming from */
}

.drop-zone--over {
  border-color: #000;
  background-color: rgba(0, 0, 0, 0.1);
}

.thumbnail {
  max-width: 100%;
  max-height: 200px;
  margin-bottom: 10px;
}
</style>

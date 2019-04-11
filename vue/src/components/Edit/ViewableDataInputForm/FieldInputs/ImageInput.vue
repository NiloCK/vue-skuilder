<template>
    <div>
        <label v-bind:for="field.name">{{field.name}}: </label>
        <div 
          v-on:drop="dropHandler"
          v-on:dragover="dragHandler"
          v-on:click="dragHandler"
        >
            Drop a file here...
          <input
              ref="inputField"
              v-bind:id="blobInputID"
              v-bind:name="field.name"
              @change="processInput"
              type="file"
              v-bind:class="validationStatus.status"
          >
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import { FieldInput } from '../FieldInput';
import { log } from 'util';

@Component
export default class ImageInput extends FieldInput {
  public dropHandler(ev: DragEvent) {
    if (ev) {
      ev.preventDefault();

      // const item = ev.dataTransfer.items[0];
      // const img = item.getAsFile()!;

      // this.setData({
      //   content_type: img.type,
      //   data: img.slice()
      // });
      // this.validate();

      const imgURL = ev.dataTransfer!.getData('text');
      this.fetchImg(imgURL);

      log(`Dropped: ${imgURL}`);
      //   this.removeDragData(ev as DragEvent);
    } else {
      log('no event');
    }
  }
  public dragHandler(ev: DragEvent) {
    if (ev) {
      ev.preventDefault();
      log(`Dragging... ${JSON.stringify(ev)}`);
    } else {
      log('no event');
    }
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
    return document.getElementById(
      this.blobInputID
    ) as HTMLInputElement;
  }

  private async fetchImg(url: string) {
    const img = await fetch(url, {
      'mode': 'no-cors',
      'content-type': 'image'
    } as any);
    const blob = await (img.body as any).blob();

    const file = new File(blob, '');
    this.setData({
      content_type: file.type,
      data: file.slice()
    });
  }

  private async processInput() {
    if (this.blobInputElement.files) {
      const file = this.blobInputElement.files[0];
      log(`
Processing input file:

Filename: ${file.name}
File size: ${file.size}
File type: ${file.type}
`);
      this.setData({
        content_type: file.type,
        data: file.slice()
      } as PouchDB.Core.FullAttachment);
      this.validate();
    }
  }

  private blobHandler(blob: Blob | null): void {
    if (blob === null) {
      alert('nullBlob');
    } else {
      (this as any).store[this.field.name] = {
        content_type: 'image/png',
        data: blob
      };
      this.validate();
    }
  }

}
</script>

<style scoped>
@import "./FieldInput.css";
</style>

<template>
    <div>
        <label v-bind:for="field.name">{{field.name}}: </label>
        <input
            v-bind:id="imgInputID"
            v-bind:name="field.name"
            @change="processInput"
            type="file"
            v-bind:class="validationStatus.status"
        >
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

    public getValidators(): ValidatingFunction[] {
        if (this.field.validator) {
            return [this.field.validator.test];
        } else {
            return [];
        }
    }

    private get imgInputID(): string {
        return 'imgInput' + this.field.name;
    }

    private get imageInputElement(): HTMLInputElement {
        return document.getElementById(
            this.imgInputID
        ) as HTMLInputElement;
    }

    private async processInput() {
        if (this.imageInputElement.files) {
            const file = this.imageInputElement.files[0];
            log(`
Processing input image:

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

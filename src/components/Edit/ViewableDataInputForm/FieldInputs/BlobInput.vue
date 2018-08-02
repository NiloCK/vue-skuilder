<template>
    <div>
        <label v-bind:for="field.name">{{field.name}}: </label>
        <input
            v-bind:id="blobInputID"
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
export default class BlobInput extends FieldInput {

    public getValidators(): ValidatingFunction[] {
        if (this.field.validator) {
            return [this.field.validator.test];
        } else {
            return [];
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

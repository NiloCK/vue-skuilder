<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xl6>
        <v-form ma-2 autocomplete="off">
          <div
            ref="fieldInputWraps"
            v-for="(field, i) in dataShape.fields"
            v-bind:key="dataShape.fields.indexOf(field)"
          >
            <string-input
              v-if="field.type === str"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <number-input
              v-else-if="field.type === num"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <integer-input
              v-else-if="field.type === int"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <image-input
              v-else-if="field.type === img"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <markdown-input
              v-else-if="field.type === mkd"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <audio-input
              v-else-if="field.type === audio"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <midi-input
              v-else-if="field.type === midi"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <media-uploader
              v-else-if="field.type === uploader"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
          </div>

          <tags-input hideSubmit="true" ref="tagsInput" v-bind:courseID="courseCfg.courseID" cardID="" />
          <v-btn
            right
            type="submit"
            color="primary"
            v-bind:loading="uploading"
            v-bind:disabled="!allowSubmit"
            v-on:click.native.prevent="submit"
          >
            Add card
            <v-icon right dark>add_circle</v-icon>
          </v-btn>
        </v-form>
      </v-flex>
      <v-flex xl6>
        <card-browser class="ml-4" v-if="inputIsValidated" v-bind:views="shapeViews" v-bind:data="[previewInput]" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts" src="./DataInputForm.ts"></script>

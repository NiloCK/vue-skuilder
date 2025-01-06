<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="6">
        <v-form ma-2 autocomplete="off">
          <div
            ref="fieldInputWraps"
            v-for="(field, i) in dataShape.fields"
            v-bind:key="dataShape.fields.indexOf(field)"
          >
            <string-input
              v-if="field.type === ftString"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <chess-puzzle-input
              v-else-if="field.type === chessPuzzle"
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
            <media-drag-drop-uploader
              v-else-if="field.type === uploader"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
          </div>

          <tags-input hideSubmit="true" ref="tagsInput" v-bind:courseID="courseCfg.courseID" cardID="" />
          <v-btn
            class="float-right"
            type="submit"
            color="primary"
            v-bind:loading="uploading"
            v-bind:disabled="!allowSubmit"
            v-on:click.prevent="submit"
          >
            Add card
            <v-icon right>mdi-plus-circle</v-icon>
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="12" xl="6">
        <card-browser class="ml-4" v-if="inputIsValidated" v-bind:views="shapeViews" v-bind:data="[previewInput]" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { alertUser } from '@/components/SnackbarService.vue';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { FieldType, fieldConverters } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { CourseConfig } from '@/server/types';
import { NameSpacer, ShapeDescriptor } from '@/courses/NameSpacer';
import { addNote55 } from '@/db/courseAPI';
import { getCourseTagStubs } from '@/db/courseDB';
import ENV from '@/ENVIRONMENT_VARS';
import Courses from '@/courses';
import FillInView from '@/courses/default/questions/fillIn/fillIn.vue';
import { CourseElo } from '@/tutor/Elo';
import _ from 'lodash';

type StringIndexable = { [x: string]: any };

export default defineComponent({
  name: 'DataInputForm',
  
  components: {
    AudioInput: () => import('./FieldInputs/AudioInput.vue'),
    NumberInput: () => import('./FieldInputs/NumberInput.vue'),
    StringInput: () => import('./FieldInputs/StringInput.vue'),
    IntegerInput: () => import('./FieldInputs/IntegerInput.vue'),
    ImageInput: () => import('./FieldInputs/ImageInput.vue'),
    MarkdownInput: () => import('./FieldInputs/MarkdownInput.vue'),
    MidiInput: () => import('./FieldInputs/MidiInput.vue'),
    CardBrowser: () => import('@/components/Edit/CardBrowser.vue'),
    DataShapeTable: () => import('@/components/Edit/DataTable/DataShapeTable.vue'),
    MediaUploader: () => import('./FieldInputs/MediaUploader.vue'),
    MediaDragDropUploader: () => import('./FieldInputs/MediaDragDropUploader.vue'),
    TagsInput: () => import('@/components/Edit/TagsInput.vue'),
    ChessPuzzleInput: () => import('./FieldInputs/ChessPuzzleInput.vue'),
  },

  props: {
    courseCfg: {
      type: Object as () => CourseConfig,
      required: true,
      default: () => ({
        courseID: 'default-test',
      }),
    },
    dataShape: {
      type: Object as () => DataShape,
      required: true,
    },
  },

  data() {
    return {
      timer: undefined as NodeJS.Timeout | undefined,
      tag: '',
      tags: [] as any[],
      autoCompleteSuggestions: [] as any[],
      allowSubmit: false,
      ftString: FieldType.STRING,
      int: FieldType.INT,
      num: FieldType.NUMBER,
      img: FieldType.IMAGE,
      mkd: FieldType.MARKDOWN,
      audio: FieldType.AUDIO,
      midi: FieldType.MIDI,
      uploader: FieldType.MEDIA_UPLOADS,
      chessPuzzle: FieldType.CHESS_PUZZLE,
    };
  },

  computed: {
    fieldInputs(): FieldInput[] {
      return (this.$refs.fieldInputWraps as HTMLDivElement[]).map<FieldInput>((div) => {
        const child: Vue = (div.children[0] as any).__vue__;
        if (this.isFieldInput(child)) {
          return child;
        } else {
          const parent = child.$parent;
          if (this.isFieldInput(parent)) {
            return parent;
          }
        }
        return new IntegerInput({});
      });
    },

    existingData: {
      get() {
        return this.$store.state.dataInputForm.existingData;
      },
      set(data) {
        this.$store.state.dataInputForm.existingData = data;
      }
    },

    shapeViews: {
      get() {
        return this.$store.state.dataInputForm.shapeViews;
      },
      set(views) {
        this.$store.state.dataInputForm.shapeViews = views;
      }
    },

    fields: {
      get() {
        return this.$store.state.dataInputForm.fields;
      },
      set(fields) {
        this.$store.state.dataInputForm.fields = fields;
      }
    },

    store: {
      get() {
        return this.$store.state.dataInputForm.localStore;
      },
      set(store) {
        this.$store.state.dataInputForm.localStore = store;
      }
    },

    uploading: {
      get() {
        return this.$store.state.dataInputForm.uploading;
      },
      set(uploading) {
        this.$store.state.dataInputForm.uploading = uploading;
      }
    },

    inputIsValidated(): boolean {
      return this.checkInput();
    },

    datashapeDescriptor(): ShapeDescriptor {
      for (const ds of this.courseCfg.dataShapes) {
        const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
        if (descriptor.dataShape === this.dataShape.name) {
          return descriptor;
        }
      }
      return {
        course: '',
        dataShape: '',
      };
    },

    previewInput() {
      this.convertInput();
      return this.store.previewInput;
    },

    convertedInput() {
      this.convertInput();
      return this.store.convertedInput;
    },
  },

  watch: {
    dataShape: {
      handler(value?: DataShape, old?: DataShape) {
        this.getImplementingViews();
      },
    },
    store: {
      handler(v: {}, old?: any) {
        this.convertInput();
      },
    },
  },

  created() {
    this.existingData = [];
    this.fields = [];
    this.store = {
      validation: {},
      convertedInput: {},
      previewInput: {},
    };
    this.uploading = false;

    this.getImplementingViews();
    this.getCourseTags();
  },

  methods: {
    // ... Rest of the methods from the class component remain the same, just moved into methods: {}
    // Only the syntax changes from public method() to method() 
    // and from private method() to method()
  }
});
</script>

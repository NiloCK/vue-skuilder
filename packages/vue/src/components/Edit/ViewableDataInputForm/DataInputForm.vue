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

          <tags-input :hideSubmit="true" ref="tagsInput" v-bind:courseID="courseCfg.courseID" cardID="" />
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
import CardBrowser from '@/components/Edit/CardBrowser.vue';
import TagsInput, { TagsInputInstance } from '@/components/Edit/TagsInput.vue';
import { FieldInputInstance, isFieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput.types';
import { alertUser } from '@/components/SnackbarService.vue';
import Courses from '@/courses';
import FillInView from '@/courses/default/questions/fillIn/fillIn.vue';
import { NameSpacer, ShapeDescriptor } from '@/courses/NameSpacer';
import { addNote55 } from '@/db/courseAPI';
import { getCourseTagStubs } from '@/db/courseDB';
import { fieldConverters, FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import _ from 'lodash';
import AudioInput from './FieldInputs/AudioInput.vue';
import ImageInput from './FieldInputs/ImageInput.vue';
import IntegerInput from './FieldInputs/IntegerInput.vue';
import MarkdownInput from './FieldInputs/MarkdownInput.vue';
import MediaDragDropUploader from './FieldInputs/MediaDragDropUploader.vue';
import MidiInput from './FieldInputs/MidiInput.vue';
import NumberInput from './FieldInputs/NumberInput.vue';
import StringInput from './FieldInputs/StringInput.vue';
import ChessPuzzleInput from './FieldInputs/ChessPuzzleInput.vue';
import { CourseElo } from '@/tutor/Elo';
import { User } from '@/db/userDB';
import { useDataInputFormStore } from '@/stores/useDataInputFormStore';

type StringIndexable = { [x: string]: any };

interface ComponentData {
  tag: string;
  tags: any[];
  autoCompleteSuggestions: any[];
  allowSubmit: boolean;
  timer?: NodeJS.Timeout;
  dataInputFormStore: ReturnType<typeof useDataInputFormStore>;
}

interface ComponentRefs {
  fieldInputWraps: HTMLDivElement[];
  tagsInput: TagsInputInstance;
}

export default defineComponent({
  name: 'DataInputForm',

  components: {
    AudioInput,
    NumberInput,
    StringInput,
    IntegerInput,
    ImageInput,
    MarkdownInput,
    MidiInput,
    CardBrowser,
    MediaDragDropUploader,
    TagsInput,
    ChessPuzzleInput,
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

  data(): ComponentData {
    return {
      tag: '',
      tags: [],
      autoCompleteSuggestions: [],
      allowSubmit: false,
      timer: undefined,
      dataInputFormStore: useDataInputFormStore(),
    };
  },

  computed: {
    ftString() {
      return FieldType.STRING;
    },
    int() {
      return FieldType.INT;
    },
    num() {
      return FieldType.NUMBER;
    },
    img() {
      return FieldType.IMAGE;
    },
    mkd() {
      return FieldType.MARKDOWN;
    },
    audio() {
      return FieldType.AUDIO;
    },
    midi() {
      return FieldType.MIDI;
    },
    uploader() {
      return FieldType.MEDIA_UPLOADS;
    },
    chessPuzzle() {
      return FieldType.CHESS_PUZZLE;
    },
    fieldInputs(): FieldInputInstance[] {
      const ret: FieldInputInstance[] = [];
      if (!this.$refs.fieldInputWraps) return ret;

      const wraps = Array.isArray(this.$refs.fieldInputWraps)
        ? this.$refs.fieldInputWraps
        : [this.$refs.fieldInputWraps];

      for (const div of wraps) {
        if (div instanceof HTMLElement) {
          const firstChild = div.children[0];
          if (firstChild) {
            const child = (firstChild as any).__vue__;
            if (isFieldInput(child)) {
              ret.push(child);
            } else if (child.$parent && isFieldInput(child.$parent)) {
              ret.push(child.$parent);
            }
          }
        }
      }
      return ret;
    },

    existingData: {
      get() {
        return this.dataInputFormStore.dataInputForm.existingData;
      },
      set(data: any) {
        this.dataInputFormStore.dataInputForm.existingData = data;
      },
    },

    shapeViews: {
      get() {
        return this.dataInputFormStore.dataInputForm.shapeViews;
      },
      set(views: any) {
        this.dataInputFormStore.dataInputForm.shapeViews = views;
      },
    },

    fields: {
      get() {
        return this.dataInputFormStore.dataInputForm.fields;
      },
      set(fields: any) {
        this.dataInputFormStore.dataInputForm.fields = fields;
      },
    },

    store: {
      get() {
        return this.dataInputFormStore.dataInputForm.localStore;
      },
      set(store: any) {
        this.dataInputFormStore.dataInputForm.localStore = store;
      },
    },

    uploading: {
      get(): boolean {
        return this.dataInputFormStore.dataInputForm.uploading;
      },
      set(uploading: boolean) {
        this.dataInputFormStore.dataInputForm.uploading = uploading;
      },
    },

    previewInput() {
      this.convertInput();
      return this.store.previewInput;
    },

    convertedInput() {
      this.convertInput();
      return this.store.convertedInput;
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
  },

  watch: {
    dataShape: {
      handler(value?: DataShape, old?: DataShape) {
        this.getImplementingViews();
      },
      immediate: true,
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

    this.getCourseTags();
  },

  methods: {
    async updateTags(newTags: string[]) {
      console.log(`[DataInputForm] tags updated: ${JSON.stringify(newTags)}`);
      this.tags = newTags;
    },

    async getCourseTags() {
      const existingTags = await getCourseTagStubs(this.courseCfg.courseID!);
      this.autoCompleteSuggestions = existingTags.rows.map((tag) => ({
        text: tag.doc!.name,
      }));
    },

    expectedValidations(): number {
      return this.dataShape.fields.length;
    },

    checkInput(): boolean {
      let validations = Object.getOwnPropertyNames(this.store.validation);
      validations = validations.filter((v) => v !== '__ob__');

      let inputIsValid: boolean = validations.length === this.expectedValidations();

      const invalidFields = Object.getOwnPropertyNames(this.store.validation).filter(
        (fieldName) => this.store.validation[fieldName] === false
      );

      if (invalidFields.length > 0) {
        inputIsValid = false;
        console.error('Invalid Fields:', invalidFields);
        invalidFields.forEach((field) => {
          console.error(`Field ${field} validation:`, this.store.validation[field]);
        });
      }

      if (inputIsValid) {
        this.convertInput();
      }
      this.allowSubmit = inputIsValid;
      console.log(`[DataInputForm] Form data is valid: ${inputIsValid}`);
      return inputIsValid;
    },

    convertInput() {
      const supplementedFields = this.dataShape.fields.map((f) => ({
        name: f.name,
        type: f.type,
        validator: f.validator,
      }));

      for (let i = 1; i < 11; i++) {
        if (this.store[`audio-${i}`]) {
          supplementedFields.push({
            name: `audio-${i}`,
            type: FieldType.AUDIO,
            validator: undefined,
          });
        } else {
          break;
        }
      }

      for (let i = 1; i < 11; i++) {
        if (this.store[`image-${i}`]) {
          supplementedFields.push({
            name: `image-${i}`,
            type: FieldType.IMAGE,
            validator: undefined,
          });
        } else {
          break;
        }
      }

      supplementedFields.forEach((fieldDef) => {
        this.store.convertedInput[fieldDef.name] = fieldConverters[fieldDef.type].databaseConverter(
          this.store[fieldDef.name]
        );
        this.store.previewInput[fieldDef.name] = fieldConverters[fieldDef.type].previewConverter(
          this.store[fieldDef.name]
        );
      });

      if (this.store.convertedInput.toggle) {
        delete this.store.convertedInput.toggle;
      } else {
        this.store.convertedInput.toggle = true;
      }
    },

    inputContainsTranspositionFcns(): boolean {
      this.convertInput();
      for (const input in this.convertedInput) {
        if (typeof this.convertedInput[input] === 'function') {
          return true;
        }
      }
      return false;
    },

    objectContainsFunction(o: StringIndexable): boolean {
      for (const key in o) {
        if (typeof o[key] === 'function') {
          return true;
        }
      }
      return false;
    },

    expandO(o: StringIndexable): StringIndexable[] {
      let ret: StringIndexable[] = [];

      if (this.objectContainsFunction(o)) {
        for (const fKey in o) {
          if (typeof o[fKey] === 'function') {
            console.log(`[DataInputForm] Key ${fKey} is a function.`);
            const replaced: StringIndexable[] = [];

            (o[fKey]() as Array<any>).forEach((fcnOutput) => {
              let copy: StringIndexable = {};
              copy = _.cloneDeep(o);
              copy[fKey] = fcnOutput;

              console.log(`[DataInputForm] Replaced Copy: ${JSON.stringify(copy)}`);

              replaced.push(copy);
            });

            replaced.forEach((obj) => {
              if (this.objectContainsFunction(obj)) {
                console.log('[DataInputForm] 2nd pass...');
                const recursiveExpansion = this.expandO(obj);
                ret = ret.concat(recursiveExpansion);
              } else {
                ret.push(obj);
              }
            });
          }
        }
        return ret;
      } else {
        return [];
      }
    },

    getTags(): string[] {
      const dataShapeParsedTags: string[] = [];

      this.fieldInputs.forEach((f) => {
        if (f.generateTags) {
          const fTags = f.generateTags();
          dataShapeParsedTags.push(...fTags);
        }
      });

      const manualTags = (this.$refs.tagsInput as any as TagsInputInstance).tags.map((t) => t.text);

      return dataShapeParsedTags.concat(manualTags);
    },

    getElo(): CourseElo | undefined {
      for (const f of this.fieldInputs) {
        if (f.generateELO) {
          return f.generateELO();
        }
      }
      return undefined;
    },

    async submit() {
      if (this.checkInput()) {
        console.log(`[DataInputForm] Store: ${JSON.stringify(this.store)}`);
        console.log(`[DataInputForm] ConvertedStore: ${JSON.stringify(this.convertedInput)}`);
        this.uploading = true;

        let inputs = [];

        if (this.inputContainsTranspositionFcns()) {
          console.log(`[DataInputForm] Expanded input: ${JSON.stringify(this.expandO(this.convertedInput))}`);
          inputs = this.expandO(this.convertedInput);
        } else {
          console.log(`[DataInputForm] No Transposition fcn detected`);
          inputs = [this.convertedInput];
        }

        const result = await Promise.all(
          inputs.map(async (input) => {
            return await addNote55(
              this.courseCfg.courseID!,
              this.datashapeDescriptor.course,
              this.dataShape,
              input,
              (
                await User.instance()
              ).username,
              this.getTags(),
              undefined,
              this.getElo()
            );
          })
        );

        if (result[0].ok) {
          alertUser({
            text: `Content added... Thank you!`,
            status: Status.ok,
          });
          const ti = this.$refs.tagsInput as any as TagsInputInstance;
          if (ti.tags.length) {
            ti.updateAvailableCourseTags();
            ti.tags = [];
          }
          this.reset();
        } else {
          alertUser({
            text: `A problem occurred. Content has not been added.`,
            status: Status.error,
          });
          console.error(`Error in DataInputForm.submit(). Result from addNote: ${JSON.stringify(result)}`);
          this.uploading = false;
        }
      }
    },

    reset() {
      this.uploading = false;

      this.fieldInputs.forEach((input) => {
        input.clearData();
      });

      const max_media_inputs = 10;

      for (let i = 1; i <= max_media_inputs; i++) {
        const audioKey = `audio-${i}`;
        if (this.store.hasOwnProperty(audioKey)) {
          delete this.store[audioKey];
          delete this.store.convertedInput[audioKey];
          delete this.store.previewInput[audioKey];
        } else {
          break;
        }
      }

      for (let i = 1; i <= max_media_inputs; i++) {
        const imageKey = `image-${i}`;
        if (this.store.hasOwnProperty(imageKey)) {
          delete this.store[imageKey];
          delete this.store.convertedInput[imageKey];
          delete this.store.previewInput[imageKey];
        } else {
          break;
        }
      }

      Object.keys(this.store.validation).forEach((key) => {
        this.store.validation[key] = {
          valid: true,
          message: '',
        };
      });

      this.store.convertedInput = {};
      this.store.previewInput = {};

      this.fieldInputs[0].focus();
      this.convertInput();
    },

    getImplementingViews() {
      if (ENV.MOCK) {
        this.shapeViews = [FillInView];
        return;
      }

      for (const ds of this.courseCfg.dataShapes) {
        const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);

        console.log('[DataInputForm] descriptor', descriptor);
        console.log('[DataInputForm] this.dataShape', this.dataShape);
        console.log('[DataInputForm] this.dataShape.name', this.dataShape.name);

        if (descriptor.dataShape === this.dataShape.name) {
          const crs = Courses.getCourse(descriptor.course)!;

          this.shapeViews = [];

          crs.getBaseQTypes().forEach((qType) => {
            if (qType.dataShapes[0].name === this.dataShape.name) {
              this.shapeViews = this.shapeViews.concat(qType.views);
            }
          });

          for (const q of ds.questionTypes) {
            const qDescriptor = NameSpacer.getQuestionDescriptor(q);
            crs.getQuestion(qDescriptor.questionType)!.views.forEach((view) => {
              this.shapeViews = this.shapeViews.concat(view);
            });
          }
        }
      }
    },

    isFieldInput(component: any): component is FieldInputInstance {
      return isFieldInput(component);
    },
  },
});
</script>

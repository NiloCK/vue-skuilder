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
            v-bind:disabled="!allowSumbit"
            v-on:click.native.prevent="submit"
          >
            Add card
            <v-icon right dark>add_circle</v-icon>
          </v-btn>
        </v-form>
      </v-flex>
      <v-flex xl6>
        <card-browser class="ml-4" v-if="allowSubmit" v-bind:views="shapeViews" v-bind:data="[previewInput]" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import CardBrowser from '@/components/Edit/CardBrowser.vue';
import DataShapeTable from '@/components/Edit/DataTable/DataShapeTable.vue';
import TagsInput from '@/components/Edit/TagsInput.vue';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { alertUser } from '@/components/SnackbarService.vue';
import Courses from '@/courses';
import { NameSpacer, ShapeDescriptor } from '@/courses/NameSpacer';
import { fieldConverters, FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { CourseConfig } from '@/server/types';
import _ from 'lodash';
import { log } from 'util';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { getCourseTagStubs } from '../../../db/courseDB';
import { addNote55 } from '@/db/courseAPI';
import SkldrVue from '../../../SkldrVue';
import AudioInput from './FieldInputs/AudioInput.vue';
import ImageInput from './FieldInputs/ImageInput.vue';
import IntegerInput from './FieldInputs/IntegerInput.vue';
import MarkdownInput from './FieldInputs/MarkdownInput.vue';
import MediaUploader from './FieldInputs/MediaUploader.vue';
import MidiInput from './FieldInputs/MidiInput.vue';
import NumberInput from './FieldInputs/NumberInput.vue';
import StringInput from './FieldInputs/StringInput.vue';

type StringIndexable = { [x: string]: any };

@Component({
  components: {
    AudioInput,
    NumberInput,
    StringInput,
    IntegerInput,
    ImageInput,
    MarkdownInput,
    MidiInput,
    CardBrowser,
    DataShapeTable,
    MediaUploader,
    TagsInput,
  },
})
export default class DataInputForm extends SkldrVue {
  @Prop({
    required: true,
  })
  public courseCfg: CourseConfig;

  private timer: NodeJS.Timeout;
  public $refs: {
    fieldInputWraps: HTMLDivElement[];
    tagsInput: TagsInput;
  };

  public get fieldInputs(): FieldInput[] {
    return this.$refs.fieldInputWraps.map<FieldInput>((div) => {
      // if ((div.children[0] as any).__vue__.clearData !==)
      //     return (div.children[0] as any).__vue__ as FieldInput;
      const child: Vue = (div.children[0] as any).__vue__;
      if (this.isFieldInput(child)) {
        return child;
      } else {
        const parent = child.$parent;
        if (this.isFieldInput(parent)) {
          return parent;
        }
      }

      return new IntegerInput({}); // ???
    });
  }

  @Prop({ required: true }) public dataShape: DataShape;

  public get existingData() {
    return this.$store.state.dataInputForm.existingData;
  }
  public set existingData(data) {
    this.$store.state.dataInputForm.existingData = data;
  }

  public tag: string = '';
  public tags: any[] = [];
  public autoCompleteSuggestions: any[] = [];

  // public shapeViews: Array<VueConstructor<Vue>>;
  public get shapeViews() {
    return this.$store.state.dataInputForm.shapeViews;
  }
  public set shapeViews(views) {
    this.$store.state.dataInputForm.shapeViews = views;
  }

  // public fields: FormInput[] = [];
  public get fields() {
    return this.$store.state.dataInputForm.fields;
  }
  public set fields(fields) {
    this.$store.state.dataInputForm.fields = fields;
  }

  // public store: any = {
  //   validation: {},
  //   convertedInput: {},
  //   previewInput: {}
  // }; // todo: see about typing this
  public get store() {
    return this.$store.state.dataInputForm.localStore;
  }
  public set store(store) {
    this.$store.state.dataInputForm.localStore = store;
  }

  // private uploading: boolean = false;
  public get uploading() {
    return this.$store.state.dataInputForm.uploading;
  }
  public set uploading(uploading) {
    this.$store.state.dataInputForm.uploading = uploading;
  }

  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;
  private readonly img: string = FieldType.IMAGE;
  private readonly mkd: string = FieldType.MARKDOWN;
  private readonly audio: string = FieldType.AUDIO;
  private readonly midi: string = FieldType.MIDI;
  private readonly uploader: string = FieldType.MEDIA_UPLOADS;

  public updateTags(newTags: string[]) {
    log(`tags updated: ${JSON.stringify(newTags)}`);
    this.tags = newTags;
  }

  public async getCourseTags() {
    const existingTags = await getCourseTagStubs(this.courseCfg.courseID!);
    this.autoCompleteSuggestions = existingTags.rows.map((tag) => {
      return {
        text: tag.doc!.name,
      };
    });
  }
  public allowSumbit: boolean = false;

  private expectedValidations(): number {
    const fieldCount = this.dataShape.fields.length;

    // as far as I can imagine, this should only ever be zero or one
    const mediaUploadCount = this.dataShape.fields.filter((f) => f.type === FieldType.MEDIA_UPLOADS).length;

    const uploadedItems = Object.getOwnPropertyNames(this.store.validation).filter((f) => {
      return /audio-[\d]+/.test(f) || /image-[\d]+/.test(f);
    }).length;

    return fieldCount + uploadedItems - mediaUploadCount;
  }

  private checkInput(): boolean {
    let inputIsValid: boolean =
      Object.getOwnPropertyNames(this.store.validation).length === this.expectedValidations() + 1; // +1 here b/c of the validation key

    const invalidFields = Object.getOwnPropertyNames(this.store.validation).filter(
      (fieldName) => this.store.validation[fieldName] === false
    );

    console.log(
      `Invalid Fields: ${invalidFields.map((f) => {
        return `\n${f}`;
      })}`
    );

    if (invalidFields.length > 0) {
      inputIsValid = false;
    }

    if (inputIsValid) {
      this.convertInput();
    }
    this.allowSumbit = inputIsValid;
    console.log(`Form data is valid: ${inputIsValid}`);
    return inputIsValid;
  }

  public get allowSubmit(): boolean {
    return this.checkInput();
  }

  @Watch('dataShape')
  public onDataShapeChange(value?: DataShape, old?: DataShape) {
    // this.getExistingNotesFromDB();
    this.getImplementingViews();
  }

  @Watch('store')
  public storeChange(v: {}, old?: any) {
    this.convertInput();
  }

  private get datashapeDescriptor(): ShapeDescriptor {
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
  }

  public created() {
    this.existingData = [];
    this.fields = [];
    this.store = {
      validation: {},
      convertedInput: {},
      previewInput: {},
    };
    this.uploading = false;

    this.onDataShapeChange();
    this.getCourseTags();
  }

  public convertInput() {
    const supplmentedFields = this.dataShape.fields.map((f) => {
      const copiedFieldDefinition: FieldDefinition = {
        name: f.name,
        type: f.type,
        validator: f.validator,
      };
      return copiedFieldDefinition;
    });

    for (let i = 1; i < 11; i++) {
      if (this.store[`audio-${i}`]) {
        supplmentedFields.push({
          name: `audio-${i}`,
          type: FieldType.AUDIO,
        });
      } else {
        break;
      }
    }

    for (let i = 1; i < 11; i++) {
      if (this.store[`image-${i}`]) {
        supplmentedFields.push({
          name: `image-${i}`,
          type: FieldType.IMAGE,
        });
      } else {
        break;
      }
    }

    supplmentedFields.forEach((fieldDef) => {
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
  }

  public get previewInput() {
    this.convertInput();
    return this.store.previewInput;
  }

  public get convertedInput() {
    this.convertInput();
    return this.store.convertedInput;
  }

  public inputContainsTranspositionFcns(): boolean {
    this.convertInput();
    for (let input in this.convertedInput) {
      if (typeof this.convertedInput[input] === 'function') {
        return true;
      }
    }
    return false;
  }

  private objectContainsFunction(o: StringIndexable): boolean {
    for (let key in o) {
      if (typeof o[key] === 'function') {
        return true;
      }
    }
    return false;
  }

  private expandO(o: StringIndexable) {
    let ret: StringIndexable[] = [];

    if (this.objectContainsFunction(o)) {
      for (let fKey in o) {
        if (typeof o[fKey] === 'function') {
          console.log(`Key ${fKey} is a function.`);
          // array of objs w/ the fcn value replaced by
          // one of its outputs
          const replaced: StringIndexable[] = [];

          (o[fKey]() as Array<any>).forEach((fcnOutput) => {
            let copy: StringIndexable = {};
            copy = _.cloneDeep(o);
            copy[fKey] = fcnOutput;

            console.log(`Replaced Copy: ${JSON.stringify(copy)}`);

            replaced.push(copy);
          });

          replaced.forEach((obj) => {
            if (this.objectContainsFunction(obj)) {
              console.log('2nd pass...');
              const recursiveExpance = this.expandO(obj);
              ret = ret.concat(recursiveExpance);
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
  }

  public async submit() {
    if (this.checkInput()) {
      log(`Store: ${JSON.stringify(this.store)}`);
      log(`ConvertedStore: ${JSON.stringify(this.convertedInput)}`);
      this.uploading = true;

      let inputs = [];

      if (this.inputContainsTranspositionFcns()) {
        console.log(`Expanded input:
        ${JSON.stringify(this.expandO(this.convertedInput))}`);
        inputs = this.expandO(this.convertedInput);
      } else {
        console.log(`No Transposition fcn detected`);
        inputs = [this.convertedInput];
      }

      const result = await Promise.all(
        inputs.map(async (input) => {
          return await addNote55(
            this.courseCfg.courseID!,
            this.datashapeDescriptor.course,
            this.dataShape,
            input,
            this.$store.state._user!.username,
            this.$refs.tagsInput.tags.map((t) => t.text)
            // generic (non-required by datashape) attachments here
          );
        })
      );

      if (result[0].ok) {
        alertUser({
          text: `Content added... Thank you!`,
          status: Status.ok,
        });
        const ti = this.$refs.tagsInput;
        if (ti.tags.length) {
          // pull down any tags just added for auto-complete suggest
          ti.updateAvailableCourseTags();
          // clear applied tags
          ti.tags = [];
        }
        this.reset();
      } else {
        alertUser({
          text: `A problem occurred. Content has not been added.`,
          status: Status.error,
        });
        log(`Error in DataInputForm.submit(). Result from addNote:

        ${JSON.stringify(result)}
      `);
        this.uploading = false;
      }
    }
  }

  private reset() {
    this.uploading = false;

    this.fieldInputs.forEach((input) => {
      input.clearData();
    });
    this.fieldInputs[0].focus();
    this.convertInput();
  }

  private getImplementingViews() {
    this.shapeViews = [];

    for (const ds of this.courseCfg.dataShapes) {
      // BUG: not finding blanks
      const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
      if (descriptor.dataShape === this.dataShape.name) {
        const crs = Courses.getCourse(descriptor.course)!;
        crs.getBaseQTypes().forEach((qType) => {
          if (qType.dataShapes[0].name === this.dataShape.name) {
            // qType.views.forEach((view) => {
            //   this.shapeViews.push(view);
            // })
            // // this.shapeViews.push(qType.views);
            this.shapeViews = this.shapeViews.concat(qType.views);
          }
        });

        for (const q of ds.questionTypes) {
          const qDescriptor = NameSpacer.getQuestionDescriptor(q);

          crs.getQuestion(qDescriptor.questionType)!.views.forEach((view) => {
            this.shapeViews.push(view);
          });
        }
      }
    }
  }

  private isFieldInput(component: any): component is FieldInput {
    return (component as FieldInput).clearData !== undefined;
  }
}
</script>

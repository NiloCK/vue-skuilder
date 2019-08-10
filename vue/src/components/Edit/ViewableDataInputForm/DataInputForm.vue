<template>
  <div>
    <v-form autocomplete="off">
      <div
        ref="fieldInputWraps"
        v-for="field in dataShape.fields"
        :key="dataShape.fields.indexOf(field)">
        
            <string-input
                v-if="field.type === str"
                v-bind:store="store"
                v-bind:field="field"
            />
            <number-input
                v-else-if="field.type === num"
                v-bind:store="store"
                v-bind:field="field"
            />
            <integer-input
                v-else-if="field.type === int"
                v-bind:store="store"
                v-bind:field="field"
            />
            <image-input
                v-else-if="field.type === img"
                v-bind:store="store"
                v-bind:field="field"
            />
            <markdown-input
                v-else-if="field.type === mkd"
                v-bind:store="store"
                v-bind:field="field"
            />
            <audio-input
                v-else-if="field.type === audio"
                v-bind:store="store"
                v-bind:field="field" 
            />
      </div>
      <v-btn
          type="submit"
          color="primary"
          :loading="uploading"
          @click.native.prevent="submit"
          :disabled="!userInputIsValid"
      >
          Add data
          <v-icon right dark>add_circle</v-icon> <!-- Remove if don't want to use icon. -->
      </v-btn>

    </v-form>
    <card-browser
      v-if="userInputIsValid"
      v-bind:views="shapeViews"
      v-bind:data="[previewInput]"
    />

    <data-shape-table
      v-bind:dataShape="dataShape"
      v-bind:data="existingData"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import FormInput from './FieldInputs/index.vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldType, fieldConverters } from '@/enums/FieldType';
import NumberInput from './FieldInputs/NumberInput.vue';
import StringInput from './FieldInputs/StringInput.vue';
import IntegerInput from './FieldInputs/IntegerInput.vue';
import ImageInput from './FieldInputs/ImageInput.vue';
import AudioInput from './FieldInputs/AudioInput.vue';
import MarkdownInput from './FieldInputs/MarkdownInput.vue';
import { getNotes, getDoc } from '@/db';
import { DisplayableData, DataShapeData, QuestionData } from '@/db/types';
import CardBrowser from '@/components/Edit/CardBrowser.vue';
import DataShapeTable from '@/components/Edit/DataTable/DataShapeTable.vue';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import Courses, { NameSpacer, ShapeDescriptor } from '@/courses';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import SkldrVue from '../../../SkldrVue';
import { CourseConfig } from '../../../server/types';
import { addNote55 } from '../../../db/courseDB';

@Component({
  components: {
    AudioInput,
    NumberInput,
    StringInput,
    IntegerInput,
    ImageInput,
    MarkdownInput,
    CardBrowser,
    DataShapeTable
  }
})
export default class DataInputForm extends SkldrVue {
  public $refs: {
    fieldInputWraps: HTMLDivElement[]
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

      return new IntegerInput({});
    });
  }

  @Prop() public dataShape: DataShape;
  @Prop() public course: CourseConfig;
  public existingData: ViewData[] = [];

  public shapeViews: Array<VueConstructor<Vue>>;

  public fields: FormInput[] = [];
  public store: any = {
    validation: {},
    convertedInput: {},
    previewInput: {}
  }; // todo: see about typing this

  private uploading: boolean = false;

  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;
  private readonly img: string = FieldType.IMAGE;
  private readonly mkd: string = FieldType.MARKDOWN;
  private readonly audio: string = FieldType.AUDIO;

  public get userInputIsValid(): boolean {
    let ret: boolean =
      Object.getOwnPropertyNames(this.store.validation).length ===
      this.dataShape.fields.length + 1; // +1 here b/c of the validation key

    Object.getOwnPropertyNames(this.store.validation).forEach((fieldName) => {
      if (this.store.validation[fieldName] === false) {
        ret = false;
      }
    });

    if (ret) {
      this.convertInput();
    }
    //   alert(ret);
    return ret;
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
    for (const ds of this.course.dataShapes) {
      const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
      if (descriptor.dataShape === this.dataShape.name) {
        return descriptor;
      }
    }

    return {
      course: '',
      dataShape: ''
    };
  }

  public created() {
    this.onDataShapeChange();
  }

  public convertInput() {
    this.dataShape.fields.forEach((fieldDef) => {
      this.store.convertedInput[fieldDef.name] =
        fieldConverters[fieldDef.type].databaseConverter(this.store[fieldDef.name]);
      this.store.previewInput[fieldDef.name] =
        fieldConverters[fieldDef.type].previewConverter(this.store[fieldDef.name]);
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

  public async submit() {
    if (this.userInputIsValid) {
      this.uploading = true;

      const result = await addNote55(
        this.course.courseID!,
        this.datashapeDescriptor.course,
        this.dataShape,
        this.convertedInput,
        this.$store.state.user
      );

      if (result.ok) {
        this.reset();
      } else {
        this.uploading = false;
      }
    }
  }

  private reset() {
    this.uploading = false;

    this.fieldInputs.forEach((input) => {
      input.clearData();
      // (input as any).value = '';
    });
    this.fieldInputs[0].focus();
  }

  private getExistingNotesFromDB() {
    this.existingData = [];


    // pre-#55 /skuilder implementation:
    // getNotes(this.course, this.dataShape).then((results) => {
    //   results.docs.forEach((doc) => {
    //     getDoc<DisplayableData>(doc._id).then((fullDoc) => {
    //       this.existingData.push(
    //         displayableDataToViewData(fullDoc)
    //       );
    //     });
    //   });
    // });
  }

  private getImplementingViews() {
    this.shapeViews = [];

    for (const ds of this.course.dataShapes) {
      const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
      if (descriptor.dataShape === this.dataShape.name) {
        const crs = Courses.getCourse(descriptor.course)!;

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


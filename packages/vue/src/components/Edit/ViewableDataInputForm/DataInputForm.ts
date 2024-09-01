import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import { alertUser } from '@/components/SnackbarService.vue';
import Courses from '@/courses';
import { NameSpacer, ShapeDescriptor } from '@/courses/NameSpacer';
import { addNote55 } from '@/db/courseAPI';
import { getCourseTagStubs } from '@/db/courseDB';
import { fieldConverters, FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import SkldrVue from '@/SkldrVue';
import _ from 'lodash';
import TagsInput from '@/components/Edit/TagsInput.vue';
import FillInView from '@/courses/default/questions/fillIn/fillIn.vue';

type StringIndexable = { [x: string]: any };

interface DataInputFormStore {
  validation: Record<string, boolean>;
  convertedInput: Record<string, any>;
  previewInput: Record<string, any>;
  [key: string]: any;
}

@Component({
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
    TagsInput,
  },
})
export default class DataInputForm extends SkldrVue {
  @Prop({ required: true }) public courseCfg!: CourseConfig;
  @Prop({ required: true }) public dataShape!: DataShape;

  public $refs!: {
    fieldInputWraps: HTMLDivElement[];
    tagsInput: TagsInput;
  };

  private timer!: NodeJS.Timeout;
  public tag: string = '';
  public tags: any[] = [];
  public autoCompleteSuggestions: any[] = [];
  public allowSubmit: boolean = false;

  public get fieldInputs(): FieldInput[] {
    return this.$refs.fieldInputWraps
      .map(div => (div.children[0] as any).__vue__)
      .filter(this.isFieldInput);
  }

  public get existingData() {
    return this.$store.state.dataInputForm.existingData;
  }
  public set existingData(data) {
    this.$store.state.dataInputForm.existingData = data;
  }

  public get shapeViews() {
    return this.$store.state.dataInputForm.shapeViews;
  }
  public set shapeViews(views) {
    this.$store.state.dataInputForm.shapeViews = views;
  }

  public get fields() {
    return this.$store.state.dataInputForm.fields;
  }
  public set fields(fields) {
    this.$store.state.dataInputForm.fields = fields;
  }

  public get store(): DataInputFormStore {
    return this.$store.state.dataInputForm.localStore;
  }
  public set store(store: DataInputFormStore) {
    this.$store.state.dataInputForm.localStore = store;
  }

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
    console.log(`tags updated: ${JSON.stringify(newTags)}`);
    this.tags = newTags;
  }

  public async getCourseTags() {
    const existingTags = await getCourseTagStubs(this.courseCfg.courseID!);
    this.autoCompleteSuggestions = existingTags.rows.map(tag => ({
      text: tag.doc!.name,
    }));
  }

  private expectedValidations(): number {
    const fieldCount = this.dataShape.fields.length;
    const mediaUploadCount = this.dataShape.fields.filter(f => f.type === FieldType.MEDIA_UPLOADS).length;
    const uploadedItems = Object.keys(this.store.validation).filter(f => /audio-[\d]+/.test(f) || /image-[\d]+/.test(f)).length;
    return fieldCount + uploadedItems - mediaUploadCount;
  }

  private checkInput(): boolean {
    const validationCount = Object.keys(this.store.validation).length;
    let inputIsValid = validationCount === this.expectedValidations() + 1;

    const invalidFields = Object.entries(this.store.validation)
      .filter(([, isValid]) => !isValid)
      .map(([fieldName]) => fieldName);

    console.log(`Invalid Fields: ${invalidFields.join('\n')}`);

    if (invalidFields.length > 0) {
      inputIsValid = false;
    }

    if (inputIsValid) {
      this.convertInput();
    }
    this.allowSubmit = inputIsValid;
    console.log(`Form data is valid: ${inputIsValid}`);
    return inputIsValid;
  }

  public get inputIsValidated(): boolean {
    return this.checkInput();
  }

  @Watch('dataShape')
  public onDataShapeChange() {
    this.getImplementingViews();
  }

  @Watch('store')
  public storeChange() {
    this.convertInput();
  }

  private get datashapeDescriptor(): ShapeDescriptor {
    for (const ds of this.courseCfg.dataShapes) {
      const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
      if (descriptor.dataShape === this.dataShape.name) {
        return descriptor;
      }
    }
    return { course: '', dataShape: '' };
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
    const supplementedFields = this.dataShape.fields.map(f => ({
      name: f.name,
      type: f.type,
      validator: f.validator,
    }));

    for (let i = 1; i < 11; i++) {
      if (this.store[`audio-${i}`]) {
        supplementedFields.push({ name: `audio-${i}`, type: FieldType.AUDIO });
      } else {
        break;
      }
    }

    for (let i = 1; i < 11; i++) {
      if (this.store[`image-${i}`]) {
        supplementedFields.push({ name: `image-${i}`, type: FieldType.IMAGE });
      } else {
        break;
      }
    }

    supplementedFields.forEach(fieldDef => {
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
    return Object.values(this.convertedInput).some(value => typeof value === 'function');
  }

  private objectContainsFunction(o: StringIndexable): boolean {
    return Object.values(o).some(value => typeof value === 'function');
  }

  private expandO(o: StringIndexable): StringIndexable[] {
    if (!this.objectContainsFunction(o)) {
      return [];
    }

    let ret: StringIndexable[] = [];

    for (const [fKey, value] of Object.entries(o)) {
      if (typeof value === 'function') {
        console.log(`Key ${fKey} is a function.`);
        const replaced: StringIndexable[] = (value() as any[]).map(fcnOutput => {
          const copy = _.cloneDeep(o);
          copy[fKey] = fcnOutput;
          console.log(`Replaced Copy: ${JSON.stringify(copy)}`);
          return copy;
        });

        replaced.forEach(obj => {
          if (this.objectContainsFunction(obj)) {
            console.log('2nd pass...');
            const recursiveExpansion = this.expandO(obj);
            ret = ret.concat(recursiveExpansion);
          } else {
            ret.push(obj);
          }
        });
      }
    }

    return ret;
  }

  public async submit() {
    if (this.checkInput()) {
      console.log(`Store: ${JSON.stringify(this.store)}`);
      console.log(`ConvertedStore: ${JSON.stringify(this.convertedInput)}`);
      this.uploading = true;

      const inputs = this.inputContainsTranspositionFcns()
        ? this.expandO(this.convertedInput)
        : [this.convertedInput];

      console.log(`${this.inputContainsTranspositionFcns() ? 'Expanded' : 'No Transposition fcn detected'} input:
      ${JSON.stringify(inputs)}`);

      const result = await Promise.all(
        inputs.map(input =>
          addNote55(
            this.courseCfg.courseID!,
            this.datashapeDescriptor.course,
            this.dataShape,
            input,
            this.$store.state._user!.username,
            this.$refs.tagsInput.tags.map(t => t.text)
          )
        )
      );

      if (result[0].ok) {
        alertUser({
          text: `Content added... Thank you!`,
          status: Status.ok,
        });
        const ti = this.$refs.tagsInput;
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
        console.error(`Error in DataInputForm.submit(). Result from addNote:

        ${JSON.stringify(result)}
      `);
        this.uploading = false;
      }
    }
  }

  private reset() {
    this.uploading = false;
    this.fieldInputs.forEach(input => input.clearData());

    const max_media_inputs = 10;
    const mediaTypes = ['audio', 'image'];

    mediaTypes.forEach(type => {
      for (let i = 1; i <= max_media_inputs; i++) {
        const key = `${type}-${i}`;
        if (this.store.hasOwnProperty(key)) {
          this.$delete(this.store, key);
          this.$delete(this.store.convertedInput, key);
          this.$delete(this.store.previewInput, key);
        } else {
          break;
        }
      }
    });

    this.store.validation = {};
    this.store.convertedInput = {};
    this.store.previewInput = {};

    this.fieldInputs[0].focus();
    this.convertInput();
  }

  private getImplementingViews() {
    if (ENV.MOCK) {
      this.shapeViews = [FillInView];
      return;
    }

    this.shapeViews = [];
    for (const ds of this.courseCfg.dataShapes) {
      const descriptor = NameSpacer.getDataShapeDescriptor(ds.name);
      if (descriptor.dataShape === this.dataShape.name) {
        const crs = Courses.getCourse(descriptor.course)!;
        crs.getBaseQTypes().forEach(qType => {
          if (qType.dataShapes[0].name === this.dataShape.name) {
            this.shapeViews = this.shapeViews.concat(qType.views);
          }
        });

        for (const q of ds.questionTypes) {
          const qDescriptor = NameSpacer.getQuestionDescriptor(q);
          crs.getQuestion(qDescriptor.questionType)!.views.forEach(view => {
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

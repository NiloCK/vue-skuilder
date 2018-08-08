<template>
  <div autocomplete="off">
      <div v-for="field in dataShape.fields" :key="dataShape.fields.indexOf(field)">
        <div v-if="field.type === str">
            <StringInput
                v-bind:store="store"
                v-bind:field="field"
            />
        </div>
        <div v-else-if="field.type === num">
            <NumberInput
                v-bind:store="store"
                v-bind:field="field"
            />
        </div>
        <div v-else-if="field.type === int">
            <IntegerInput
                v-bind:store="store"
                v-bind:field="field"
            />
        </div>
        <div v-else-if="field.type === img">
            <BlobInput
                v-bind:store="store"
                v-bind:field="field"
            />    
        </div>
      </div>
      <v-btn
          color="primary"
          :loading="uploading"
          @click.native="submit"
          :disabled="!userInputIsValid"
      >
          Add data
          <v-icon right dark>add_circle</v-icon> <!-- Remove if don't want to use icon. -->
      </v-btn>

      <CardBrowser
        v-if="userInputIsValid"
        v-bind:views="shapeViews"
        v-bind:data="[previewInput]"
      />

      <DataShapeTable
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
import BlobInput from './FieldInputs/BlobInput.vue';
import { addNote, getNotes, getDoc } from '@/db';
import { DisplayableData, DataShapeData, QuestionData } from '@/db/types';
import CardBrowser from '@/components/Edit/CardBrowser.vue';
import DataShapeTable from '@/components/Edit/DataTable/DataShapeTable.vue';
import { ViewData, displayableDataToViewData } from '@/base-course/Interfaces/ViewData';
import Courses, { NameSpacer } from '@/courses';
import { alertUser } from '@/components/SnackbarService.vue';
import { Status } from '@/enums/Status';

@Component({
    components: {
        NumberInput,
        StringInput,
        IntegerInput,
        BlobInput,
        CardBrowser,
        DataShapeTable
    }
})
export default class DataInputForm extends Vue {
    @Prop() public dataShape: DataShape;
    @Prop() public course: string;
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
        this.getExistingNotesFromDB();
        this.getImplementingViews();
    }

    @Watch('store')
    public storeChange(v: {}, old?: any) {
        this.convertInput();
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

    public submit() {
        if (this.userInputIsValid) {
            this.uploading = true;
            addNote(this.course, this.dataShape, this.store.convertedInput)
                .then((resp) => {
                    this.uploading = false;
                    alertUser({
                        text: 'Data uploaded',
                        status: Status.ok
                    });
                });
        }
    }

    private getExistingNotesFromDB() {
        this.existingData = [];

        getNotes(this.course, this.dataShape).then((results) => {
            results.docs.forEach((doc) => {
                getDoc<DisplayableData>(doc._id).then((fullDoc) => {
                    this.existingData.push(
                        displayableDataToViewData(fullDoc)
                    );
                });
            });
        });
    }

    private getImplementingViews() {
        this.shapeViews = [];

        const dataShapeId = NameSpacer.getDataShapeString({
            course: this.course,
            dataShape: this.dataShape.name
        });

        getDoc<DataShapeData>(dataShapeId).then((shape) => {
            shape.questionTypes.forEach((questionId) => {
                const questionName = NameSpacer.getQuestionDescriptor(
                    questionId
                ).questionType;

                Courses.getCourse(this.course)!.getQuestion(
                    questionName
                )!.views.forEach((view) => {
                    this.shapeViews.push(view);
                });
            });
        });
    }
}
</script>


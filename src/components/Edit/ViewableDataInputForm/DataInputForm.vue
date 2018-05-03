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
      </div>
      <button v-bind:disabled="!userInputIsValid" v-on:click="submit">Add Data</button>

      <CardViewer
        v-if="userInputIsValid"
        v-bind:view="dataShape.views[0]"
        v-bind:data="store"
      />

      <DataShapeTable v-bind:dataShape="dataShape" />      
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import FormInput from './FieldInputs/index.vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldType, fieldConverters } from '@/enums/FieldType';
import NumberInput from './FieldInputs/NumberInput.vue';
import StringInput from './FieldInputs/StringInput.vue';
import IntegerInput from './FieldInputs/IntegerInput.vue';
import { addNote } from '@/db';
import CardViewer from '@/components/Study/CardViewer.vue';
import DataShapeTable from '@/components/Edit/DataTable/DataShapeTable.vue';

@Component({
    components: {
        NumberInput,
        StringInput,
        IntegerInput,
        CardViewer,
        DataShapeTable
    }
})
export default class DataInputForm extends Vue {
  @Prop() public dataShape: DataShape;
  @Prop() public course: string;
  public fields: FormInput[] = [];
  public store: any = {
      validation: {},
      convertedInput: {}
  }; // todo: see about typing this

  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;

  public get userInputIsValid(): boolean {
      let ret: boolean =
        Object.getOwnPropertyNames(this.store.validation).length ===
        this.dataShape.fields.length + 1; // +1 here b/c of the validation key

      Object.getOwnPropertyNames(this.store.validation).forEach( (fieldName) => {
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

  public convertInput() {
      this.dataShape.fields.forEach( (fieldDef) => {
          this.store.convertedInput[fieldDef.name] =
            fieldConverters[fieldDef.type](this.store[fieldDef.name])
      });
  }

  public submit() {
    if (this.userInputIsValid) {
      addNote(this.course, this.dataShape, this.store.convertedInput);
    }
  }
}
</script>


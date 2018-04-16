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
      <button v-on:click="submit">Add Data</button>

      <CardViewer 
        v-bind:view="dataShape.views[0]"
        v-bind:data="store" 
      />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormInput from './FieldInputs/index.vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldType } from '@/enums/FieldType';
import NumberInput from './FieldInputs/NumberInput.vue';
import StringInput from './FieldInputs/StringInput.vue';
import IntegerInput from './FieldInputs/IntegerInput.vue';
import { addNote } from '@/db';
import CardViewer from '@/components/Study/CardViewer.vue';

@Component({
    components: {
        NumberInput,
        StringInput,
        IntegerInput,
        CardViewer
    }
})
export default class DataInputForm extends Vue {
  @Prop() public dataShape: DataShape;
  @Prop() public course: string;
  public fields: FormInput[] = [];
  public store: any = {}; // todo: see about typing this

  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;

  public sayhi() {
      alert(this.dataShape.fields.length);
  }
  public submit() {
      // todo: check validators

      // submit data from this.store to the database

      // test Fcn: works!!
    //   alert(`
    //   Course: ${this.course}
    //   dataShape: ${JSON.stringify(this.dataShape)}
    //   data: ${JSON.stringify(this.store)}
    //   `);
      addNote(this.course, this.dataShape, this.store);
  }
}
</script>


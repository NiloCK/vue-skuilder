import { defineStore } from 'pinia';
import { VueConstructor } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { CourseConfig } from '@/server/types';
import { FieldInputInstance } from '@/components/Edit/ViewableDataInputForm/FieldInput.types';
import { ViewComponent } from '@/base-course/Displayable';

interface DataInputForm {
  // current props
  dataShape: DataShape | null;
  course: CourseConfig | null;

  existingData: ViewData[];
  shapeViews: ViewComponent[];

  fields: FieldInputInstance[];
  localStore: any; // [ ] type this...

  uploading: boolean;
}

interface DataInputFormState {
  dataInputForm: DataInputForm;
}

export const useDataInputFormStore = defineStore('dataInputForm', {
  state: (): DataInputFormState => ({
    dataInputForm: {
      dataShape: null,
      course: null,
      existingData: [],
      shapeViews: [],
      fields: [],
      localStore: {},
      uploading: false,
    },
  }),
  // actions or getters if needed
  actions: {
    setDataShape(ds: DataShape) {
      this.dataInputForm.dataShape = ds;
    },
    setCourse(course: CourseConfig) {
      this.dataInputForm.course = course;
    },
    // etc. create any convenience setters or methods you wish
  },
});

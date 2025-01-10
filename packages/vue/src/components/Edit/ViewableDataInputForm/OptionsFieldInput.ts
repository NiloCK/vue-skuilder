import { defineComponent, PropType } from 'vue';
import { FieldDefinition } from '../../../base-course/Interfaces/FieldDefinition';
import {
  ValidatingFunction,
  validationFunctionToVuetifyRule,
} from '../../../base-course/Interfaces/ValidatingFunction';
import { ValidationResult } from '../../../base-course/Interfaces/ValidationResult';
import { Status } from '../../../enums/Status';
import { CourseElo } from '../../../tutor/Elo';

export interface ValidatedInput {
  getValidators: () => ValidatingFunction[];
}

export default defineComponent({
  name: 'FieldInput',

  props: {
    autofocus: Boolean,
    field: {
      type: Object as PropType<FieldDefinition>,
      required: true,
    },
    store: {
      type: Object as PropType<any>,
      required: true,
    },
    uiValidationFunction: {
      type: Function as PropType<() => boolean>,
      required: true,
    },
  },

  data() {
    return {
      validationStatus: {
        status: Status.ok,
        msg: '',
      } as ValidationResult,
    };
  },

  computed: {
    validators(): ValidatingFunction[] {
      const ret = [];
      if (this.field?.validator) {
        ret.push(this.field.validator.test);
      }
      return ret;
    },
  },

  methods: {
    focus(): void {
      (this.$refs.inputField as HTMLInputElement).focus();
    },

    userInput() {
      if (!this.field?.name) {
        throw new Error('Field name is required for FieldInput component');
      }
      return this.store[this.field.name];
    },

    setData(data: any) {
      if (!this.field?.name) {
        throw new Error('Field name is required for FieldInput component');
      }
      this.store[this.field.name] = data;
    },

    clearData() {
      const inputField = this.$refs.inputField as HTMLInputElement;
      if (inputField.type === 'file') {
        inputField.value = '';
      }
      if (!this.field?.name) return;
      this.store[this.field.name] = '';
    },

    vuetifyRules() {
      if (this.field?.validator) {
        return this.validators.map((f) => {
          return validationFunctionToVuetifyRule(f);
        });
      }
      return [];
    },

    generateTags() {
      console.log('[FieldInput] Running generic generateTags() in FieldInput.ts');
      return this.field?.tagger ? this.field.tagger(this.userInput()) : [];
    },

    generateELO(): CourseElo | undefined {
      console.log('[FieldInput] Running generic generateELO() in FieldInput.ts');
      return this.field?.generateELO ? this.field.generateELO(this.userInput()) : undefined;
    },

    validate() {
      let ret: ValidationResult = {
        status: Status.ok,
        msg: '',
      };

      const validators = this.validators;
      let index = 0;
      while (ret.status === Status.ok && index < validators.length) {
        ret = validators[index](this.userInput());
        console.log(`[FieldInput] validation[${index}]\n ${ret.status}\n  ${ret.msg}`);
        index++;
      }

      this.validationStatus.status = ret.status;
      this.validationStatus.msg = ret.msg;

      const validationResult = ret.status === Status.ok;

      if (this.field?.name) {
        this.$set(this.store['validation'], this.field.name, validationResult);

        if (!validationResult) {
          delete this.store[this.field.name];
        }
      }

      this.uiValidationFunction();

      return ret;
    },
  },
});

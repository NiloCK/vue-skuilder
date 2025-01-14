import { ValidationResult } from '../../../base-course/Interfaces/ValidationResult';
import { ValidatingFunction } from '../../../base-course/Interfaces/ValidatingFunction';
import { CourseElo } from '../../../tutor/Elo';
import { ComponentPublicInstance } from 'vue';

export interface FieldInputInterface {
  $refs: {
    inputField: HTMLInputElement;
  };
  validationStatus: ValidationResult;
  validators: ValidatingFunction[];
  focus: () => void;
  userInput: () => any;
  setData: (data: any) => void;
  clearData: () => void;
  vuetifyRules: () => any[];
  generateTags: () => string[];
  generateELO: () => CourseElo | undefined;
  validate: () => ValidationResult;
}

// Type guard
export function isFieldInput(component: any): component is FieldInputInstance {
  return (
    component &&
    typeof component.clearData === 'function' &&
    typeof component.validate === 'function'
  );
}

// This combines the Vue component instance type with our interface
export type FieldInputInstance = ComponentPublicInstance & FieldInputInterface;

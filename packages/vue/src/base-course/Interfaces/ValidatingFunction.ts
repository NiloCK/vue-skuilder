import { ValidationResult } from '../../base-course/Interfaces/ValidationResult';
import { Status } from '../../enums/Status';

export type ValidatingFunction = (value: string) => ValidationResult;
export type VuetifyRule = (value: string) => true | string;

export function validationFunctionToVuetifyRule(f: ValidatingFunction): VuetifyRule {
  return (value: string) => {
    const result = f(value);

    if (result.status === Status.ok) {
      return true;
    } else {
      return result.msg;
    }
  };
}

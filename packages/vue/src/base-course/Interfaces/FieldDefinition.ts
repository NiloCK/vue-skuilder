import { Validator } from '../../base-course/Interfaces/Validator';
import { FieldType } from '../../enums/FieldType';

export interface FieldDefinition {
  name: string;
  type: FieldType;
  validator?: Validator;
}

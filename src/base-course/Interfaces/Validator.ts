import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';

export interface Validator {
    instructions?: string;
    placeholder?: string;
    test: ValidatingFunction;
}

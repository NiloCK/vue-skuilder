import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';

export interface ValidatedInput {
    getValidators: () => ValidatingFunction[];
}

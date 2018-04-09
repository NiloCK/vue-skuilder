import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import Vue from 'vue';

export interface ValidatedInput {
    getValidators: () => ValidatingFunction[];
}

export abstract class FieldInput extends Vue {
    public abstract getValidators(): ValidatingFunction[];
}

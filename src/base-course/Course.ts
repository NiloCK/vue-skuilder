import { NoteCtor, VueComponentName } from '@/db/types';

export abstract class Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question {
    public static dataShape: DataShape;
    public abstract isCorrect(answer: Answer): boolean;
}

enum PropType {
    String = 'string',
    Number = 'number'
    // image, audio, video, etc. Various blob data
}

export interface DataShape {
    name: NoteCtor;
    fields: FieldDefinition[];
}

export interface FieldDefinition {
    name: string;
    type: FieldType;
    validator?: Validator;
}

export enum Status {
    ok = 'ok',
    warning = 'warning',
    error = 'error'
}

interface Validator {
    instructions?: string;
    placeholder?: string;
    test: ValidatingFunction;
}

export type ValidatingFunction = (value: string) => ValidationResult;

export interface ValidationResult {
    status: Status;
    msg: string;
}

export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int'
}

export interface View {
    name: string;
}

export interface Course {
    viewableTypes: Array<typeof Question>;
}

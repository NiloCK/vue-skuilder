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

// tslint:disable-next-line:max-classes-per-file
// export class Course {
//     public name: string = '';
//     // public cardTypes: Array<[DataShape, VueComponentName[]]> = [];
//     public questionTypes: Array<typeof Question> = [];

//     /**
//      *
//      */
//     constructor(
//         name: string,
//         cardTypes: Array<typeof Question>) {
//             this.name = name;
//             this.questionTypes = cardTypes;
//     }

//     public getDataShapeNames() {
//         const ret: string[] = [];
//         this.questionTypes.forEach( (qType) => {
//         })
//     }

// }
export interface Course {
    viewableTypes: Array<typeof Question>;
}

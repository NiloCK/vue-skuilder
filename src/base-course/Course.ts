import { NoteCtor, VueComponentName } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { Validator } from '@/base-course/Interfaces/Validator';
import { DataShape } from '@/base-course/Interfaces/DataShape';

export abstract class Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Displayable {
    public static dataShape: DataShape;
}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question extends Displayable {
    public abstract isCorrect(answer: Answer): boolean;
}

export interface Course {
    viewableTypes: Array<typeof Question>;
}

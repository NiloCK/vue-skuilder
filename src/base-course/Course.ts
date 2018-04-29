import { NoteCtor, VueComponentName } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { Validator } from '@/base-course/Interfaces/Validator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';

export abstract class Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Displayable {
    public static dataShape: DataShape;
    /**
     *
     */
    constructor(viewData: ViewData) {
        validateData(this.dataShape(), viewData);
    }

    public abstract dataShape(): DataShape;
}

function validateData(shape: DataShape, data: ViewData) {
    shape.fields.forEach( (field) => {
        if (data[field.name] === undefined) {
            throw new Error(`field validation failed: ${field.name}`);
        }
    });
}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question extends Displayable {
    public abstract isCorrect(answer: Answer): boolean;
}

export interface Course {
    viewableTypes: Array<typeof Question>;
}

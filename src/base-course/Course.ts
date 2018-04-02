import { NoteCtor, FieldDefinition, VueComponentName } from '@/db/types';

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

export interface View {
    name: string;
}

// tslint:disable-next-line:max-classes-per-file
export class Course {
    public name: string = '';
    // public cardTypes: Array<[DataShape, VueComponentName[]]> = [];
    public questionTypes: Array<typeof Question> = [];

    /**
     *
     */
    constructor(
        name: string,
        cardTypes: Array<typeof Question>) {
            this.name = name;
            this.questionTypes = cardTypes;
    }

    public getDataShapeNames() {
        const ret: string[] = [];
        this.questionTypes.forEach( (qType) => {
            
        })
    }

}

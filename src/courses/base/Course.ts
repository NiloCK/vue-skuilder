import { DataShapeData, NoteCtor } from '@/db/types';

export abstract class Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question {
    public static dataShape: PropDefinition[];
    public abstract isCorrect(answer: Answer): boolean;
}

enum PropType {
    String = 'string',
    Number = 'number'
    // image, audio, video, etc. Various blob data
}

export interface PropDefinition {
    name: string;
    type: PropType;
}

// tslint:disable-next-line:max-classes-per-file
class Course {
    public name: string = '';
    public cardTypes: Array<[DataShapeData, NoteCtor[]]> = [];

    /**
     *
     */
    constructor(name: string, cardTypes: Array<[DataShapeData, NoteCtor[]]>) {
        this.name = name;
        this.cardTypes = cardTypes;
    }

    public getDataShapeNames(): string[] {
        const ret: string[] = [];
        this.cardTypes.forEach( (cardType) => {
            ret.push(cardType[0].name);
        });
        return ret;
    }

}

import { Question, Answer } from '@/base-course/Course';
import { randomInt } from '@/courses/math/utility';
import { DataShapeData } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import HorizontalAddition from './horizontal.vue';
import { ViewData } from '@/base-course/Interfaces/ViewData';

const fields: FieldDefinition[] = [
    {
        name: 'a',
        type: FieldType.INT
    },
    {
        name: 'b',
        type: FieldType.INT
    }
];

export class SingleDigitAdditionQuestion extends Question {
    public static dataShape = {
        name: SingleDigitAdditionQuestion.name,
        fields,
        views: [ HorizontalAddition ]
    };

    public a: number;
    public b: number;

    constructor(data: ViewData) {
        super(data);
        this.a = data.a as number;
        this.b = data.b as number;
    }

    public isCorrect(answer: Answer) {
        alert(`a: ${this.a}, b: ${this.b}, answer: ${answer}`);
        alert(`this.a + this.b: ${this.a + this.b}`);
        return (1 * this.a) + this.b === answer;
    }

    public dataShape() {
        return SingleDigitAdditionQuestion.dataShape;
    }
}

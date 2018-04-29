import { Question, Answer } from '@/base-course/Course';
import { randomInt } from '@/courses/math/utility';
import { DataShapeData } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import HorizontalMultiplication from './horizontal.vue';
import VerbalMultiplication from './verbal.vue';

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

export class SingleDigitMultiplicationQuestion extends Question {
    public static dataShape = {
        name: SingleDigitMultiplicationQuestion.name,
        fields,
        views: [ HorizontalMultiplication,
        VerbalMultiplication ]
    };

    public a: number;
    public b: number;

    constructor(data: ViewData) {
        super(data);
        this.a = data.a as number;
        this.b = data.b as number;
    }

    public isCorrect(answer: Answer) {
        return this.a * this.b === answer;
    }

    public dataShape() {
        return SingleDigitMultiplicationQuestion.dataShape;
    }
}

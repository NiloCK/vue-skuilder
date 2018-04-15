import { Question, Answer } from '@/base-course/Course';
import { randomInt } from '@/courses/math/utility';
import { DataShapeData } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import HorizontalMultiplication from './horizontal.vue';

interface SingleDigitMultiplicationQuestionProps {
    a: number;
    b: number;
}

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
        views: [ HorizontalMultiplication ]
    };
    public data: SingleDigitMultiplicationQuestionProps;

    constructor(data?: SingleDigitMultiplicationQuestionProps) {
        super();
        this.data = data ? data : {
            a: randomInt(0, 10),
            b: randomInt(0, 10)
        };
    }

    public isCorrect(answer: Answer) {
        const { a, b } = this.data;

        return a * b === answer;
    }
}

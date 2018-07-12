import { Answer, Question } from '@/base-course/Course';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import VerbalMultiplication from './verbal.vue';
import MultiplicationHorizontal from './blorizontal.vue';

const validator = {
    instructions: 'An integer between 0 and 10, inclusive.',
    test: (value: string) => {
        const input = parseInt(value, 10);
        if (0 <= input && input <= 10) {
            return {
                status: Status.ok,
                msg: ''
            };
        } else {
            return {
                status: Status.error,
                msg: 'Single digit multiplication problem inputs must be between 0 and 10, inclusive.'
            };
        }
    }
};

const fields: FieldDefinition[] = [
    {
        name: 'a',
        type: FieldType.INT,
        validator
    },
    {
        name: 'b',
        type: FieldType.INT,
        validator
    }
];

export class SingleDigitMultiplicationQuestion extends Question {
    public static dataShapes = [{
        name: SingleDigitMultiplicationQuestion.name,
        fields,
        views: [
            VerbalMultiplication,
            MultiplicationHorizontal
        ]
    }];

    public a: number;
    public b: number;

    constructor(data: ViewData[]) {
        super(data);
        this.a = data[0].a as number;
        this.b = data[0].b as number;
    }

    public isCorrect(answer: Answer) {
        return this.a * this.b === answer;
    }

    public dataShapes() {
        return SingleDigitMultiplicationQuestion.dataShapes;
    }
}

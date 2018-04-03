import { Question, Answer } from '@/base-course/Course';
import { randomInt } from '@/courses/math/utility';
import { DataShapeData, FieldType, FieldDefinition } from '@/db/types';

interface SingleDigitDivisionQuestionProps {
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
        type: FieldType.INT,
        validator: (value: string) => {
            return parseInt(value, 10) > 0;
        }
    }
];

export class SingleDigitDivisionQuestion extends Question {
    public static dataShape = {
        name: 'SingleDigitDivisionQuestion',
        fields
    };
    public data: SingleDigitDivisionQuestionProps;

    /**
     * @param data a and b are seed props that will pop a question of
     * the form [(a*b) / b = ___]. So, b must be non-zero.
     */
    constructor(data?: SingleDigitDivisionQuestionProps) {
        super();
        this.data = data ? data : {
            a: randomInt(0, 10),
            b: randomInt(1, 10)
        };
    }

    public isCorrect(answer: Answer) {
        const { a, b } = this.data;

        return a * b === answer;
    }
}

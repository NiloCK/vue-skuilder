import { Question, Answer, FieldDefinition, FieldType, Status } from '@/base-course/Course';
import { randomInt } from '@/courses/math/utility';
import { DataShapeData } from '@/db/types';

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
        validator: {
            instructions: 'An integer between 1 and 10, inclusive.',
            test: (value: string) => {
                const input = parseInt(value, 10);
                if (0 < input && input < 11) {
                    return {
                        status: Status.ok,
                        msg: ''
                    };
                } else if (input === 0) {
                    return {
                        status: Status.error,
                        msg: 'Thou shalt not divide by zero.'
                    };
                } else {
                    return {
                        status: Status.error,
                        msg: 'Single digit division problem divisors must be between 1 and 10, inclusive.'
                    };
                }
            }
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

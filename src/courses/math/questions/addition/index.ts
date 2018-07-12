import { Answer, Question } from '@/base-course/Course';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { FieldType } from '@/enums/FieldType';
import HorizontalAddition from './horizontal.vue';
import VerbalAddition from './verbal.vue';

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
    public static dataShapes = [{
        name: SingleDigitAdditionQuestion.name,
        fields,
        views: [HorizontalAddition, VerbalAddition]
    }];

    public a: number;
    public b: number;

    constructor(data: ViewData[]) {
        super(data);
        this.a = data[0].a as number;
        this.b = data[0].b as number;
    }

    public isCorrect(answer: Answer) {
        alert(`a: ${this.a}, b: ${this.b}, answer: ${answer}`);
        alert(`this.a + this.b: ${this.a + this.b}`);
        return (1 * this.a) + this.b === answer;
    }

    public dataShapes() {
        return SingleDigitAdditionQuestion.dataShapes;
    }
}

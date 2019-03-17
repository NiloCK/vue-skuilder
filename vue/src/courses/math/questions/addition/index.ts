import { Answer, Question } from '@/base-course/Displayable';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { FieldType } from '@/enums/FieldType';
import HorizontalAddition from './horizontal.vue';
import VerbalAddition from './verbal.vue';
import { DataShapeName } from '@/enums/DataShapeNames';

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
        name: DataShapeName.MATH_SingleDigitAddition,
        fields
    }];

    public static views = [
        HorizontalAddition,
        VerbalAddition
    ];

    public a: number;
    public b: number;

    constructor(data: ViewData[]) {
        super(data);
        this.a = data[0].a as number;
        this.b = data[0].b as number;
    }

    public isCorrect(answer: Answer) {
        return (1 * this.a) + this.b === answer;
    }

    public dataShapes() {
        return SingleDigitAdditionQuestion.dataShapes;
    }

    public views() {
        return SingleDigitAdditionQuestion.views;
    }
}

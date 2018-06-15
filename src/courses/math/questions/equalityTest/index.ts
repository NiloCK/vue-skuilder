import { Question, Answer } from '@/base-course/Course';
import { DataShapeData } from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import TrueFalse from './trueFalse.vue';

const fields: FieldDefinition[] = [
    {
        name: 'a',
        type: FieldType.STRING
    },
    {
        name: 'b',
        type: FieldType.STRING
    }
];

export class EqualityTest extends Question {
    public static dataShape = {
        name: EqualityTest.name,
        fields,
        views: [ TrueFalse ]
    };

    public a: string; // vueComponent / "MathJax expression" or something
    public b: string;

    /**
     * @param data a and b are seed props that will pop a question of
     * the form [(a*b) / b = ___]. So, b must be non-zero.
     */
    constructor(data: ViewData) {
        super(data);
        this.a = data.a as string;
        this.b = data.b as string;
    }

    public isCorrect(answer: Answer) {
        return true;
    }

    public dataShape() {
        return EqualityTest.dataShape;
    }
}

import { Question, Answer } from '@/base-course/Course';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import AudioParseView from './view.vue';

export class AudioParsingQuestion extends Question {
    public static dataShapes = [{
        name: DataShapeName.AudioParse,
        fields: [
            {
                name: 'audio',
                type: FieldType.IMAGE
            },
            {
                name: 'text',
                type: FieldType.STRING
            }
        ]
    }];
    public static views = [
        AudioParseView
    ];

    public audio: Blob;
    public text: string;

    constructor(data: ViewData[]) {
        super(data);
        this.audio = data[0].audio as Blob;
        this.text = data[0].text as string;
    }

    public isCorrect(answer: Answer): boolean {
        return true;
    }

    public dataShapes() {
        return AudioParsingQuestion.dataShapes;
    }
    public views() {
        return AudioParsingQuestion.views;
    }
}

import { Question, Answer } from '../../../../base-course/Displayable';
import { DataShapeName } from '../../../../enums/DataShapeNames';
import { FieldType } from '../../../../enums/FieldType';
import { ViewData } from '../../../../base-course/Interfaces/ViewData';
import AudioParseView from './view.vue';
import { DataShape } from '../../../../base-course/Interfaces/DataShape';
import { Status } from '../../../../enums/Status';

export class AudioParsingQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      name: DataShapeName.FRENCH_AudioParse,
      fields: [
        {
          name: 'audio',
          type: FieldType.IMAGE,
        },
        {
          name: 'text',
          type: FieldType.STRING,
          validator: {
            test: (value: string) => {
              const good = value.length < 45;
              return {
                msg: good ? '' : "It's too long!",
                status: good ? Status.ok : Status.error,
              };
            },
          },
        },
      ],
    },
  ];
  public static views = [AudioParseView];

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

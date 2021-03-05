import { Question } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { NonEmptyString } from '@/base-course/Validators';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import { Answer } from '../../../../base-course/Displayable';
import TextBox from './textBox.vue';

enum Chroma {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
}

const fields: FieldDefinition[] = [
  {
    name: 'Chroma',
    type: FieldType.STRING,
    validator: {
      test: (value) => {
        let e = new Enumerator(Chroma);
        e.moveFirst();
        while (!e.atEnd()) {
          let c = e.item();

          if (c === value) {
            return {
              status: Status.ok,
              msg: '',
            };
          }

          e.moveNext();
        }
        return {
          status: Status.error,
          msg: "That's not a chroma!",
        };
      },
      instructions: 'Awefjiop',
    },
  },
];

export class ChromaQuestion extends Question {
  public static dataShapes: DataShape[] = [
    {
      fields,
      name: DataShapeName.PITCH_chroma,
    },
  ];

  public static views = [TextBox];

  public chroma: Chroma;

  constructor(data: ViewData[]) {
    super(data);

    this.chroma = data[0].Chroma as Chroma;
  }
  public get baseFreq(): number {
    const aFreq = 440;

    if (this.chroma === 'A') return aFreq;
    else if (this.chroma === 'B') return aFreq * Math.pow(2, 2 / 12);
    else if (this.chroma === 'C') {
      return aFreq * Math.pow(2, 3 / 12);
    }

    return aFreq;
  }

  public get choiceList(): string[] {
    return _.shuffle([this.chroma.toString(), 'test', 'options', 'are', 'fun']);
  }

  public isCorrect(answer: Answer): boolean {
    // alert(JSON.stringify(answer));
    return (answer as any).choiceList[(answer as any).selection] === this.chroma.toString();
  }
  public dataShapes(): DataShape[] {
    return ChromaQuestion.dataShapes;
  }
  public views() {
    return ChromaQuestion.views;
  }
}

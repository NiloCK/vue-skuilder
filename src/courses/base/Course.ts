export abstract class Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question {
    public static dataShape: PropDefinition[];
    public abstract isCorrect(answer: Answer): boolean;
}

enum PropType {
    String = 'string',
    Number = 'number',
    // image, audio, video, etc. Various blob data
}

export interface PropDefinition {
    name: string;
    type: PropType;
}

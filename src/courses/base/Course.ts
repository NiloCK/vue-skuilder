enum Viewables {
    Persion,
    Dog
}

class Cat {
    kind: Viewables = Viewables.Persion;
}
class Dog {

}

export abstract class Answer {

}

export abstract class Question {
    static dataShape: PropDefinition[];
    abstract isCorrect(answer: Answer): boolean;
}

enum PropType {
    String = "string",
    Number = "number"
    // image, audio, video, etc. Various blob data
}

export interface PropDefinition {
    name: string;
    type: PropType;
}
import { Question, Answer } from "@/courses/base/Course";
import { randomInt } from "@/courses/math/utility";

interface SingleDigitMultiplicationQuestionProps {
    a: number;
    b: number;
}

export class SingleDigitMultiplicationQuestion extends Question {
    data: SingleDigitMultiplicationQuestionProps;

    constructor(data?: SingleDigitMultiplicationQuestionProps) {
        super();
        this.data = data ? data : {
            a: randomInt(0, 10),
            b: randomInt(0, 10)
        }
    }

    isCorrect(answer: Answer) {
        let { a, b } = this.data;

        return a * b === answer;
    }
}
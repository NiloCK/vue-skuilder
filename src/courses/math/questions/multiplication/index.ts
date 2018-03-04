import { Question, Answer } from "@/courses/base/Course";

interface SingleDigitMultiplicationQuestionProps {
    a: number;
    b: number;
}

export class SingleDigitMultiplicationQuestion extends Question {
    data: SingleDigitMultiplicationQuestionProps;

    isCorrect(answer: Answer) {
        let { a, b } = this.data;

        return a * b === answer;
    }

    constructor() {
        super();
        this.data = {
            a: 3,
            b: 9
        }
    }
}
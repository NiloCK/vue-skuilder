import { Course } from '@/base-course/Course';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { SingleDigitDivisionQuestion } from '@/courses/math/questions/division';
import { SingleDigitAdditionQuestion } from '@/courses/math/questions/addition';
import { EqualityTest } from './questions/equalityTest';

const math: Course = {
    viewableTypes: [
        SingleDigitDivisionQuestion,
        SingleDigitMultiplicationQuestion,
        SingleDigitAdditionQuestion,
        EqualityTest
    ]
};

export default math;

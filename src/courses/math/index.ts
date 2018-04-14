import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { SingleDigitDivisionQuestion } from '@/courses/math/questions/division';
import { Course } from '@/base-course/Course';

const math: Course = {
    viewableTypes: [
        SingleDigitMultiplicationQuestion,
        SingleDigitDivisionQuestion
    ]
}

export default math;

// export default [
//     SingleDigitMultiplicationQuestion,
//     SingleDigitDivisionQuestion
// ];

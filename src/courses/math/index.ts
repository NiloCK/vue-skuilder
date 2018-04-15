import { Course } from '@/base-course/Course';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { SingleDigitDivisionQuestion } from '@/courses/math/questions/division';
import { SingleDigitAdditionQuestion } from '@/courses/math/questions/addition';

const math: Course = {
    viewableTypes: [
        SingleDigitDivisionQuestion,
        SingleDigitMultiplicationQuestion,
        SingleDigitAdditionQuestion
    ]
};

export default math;

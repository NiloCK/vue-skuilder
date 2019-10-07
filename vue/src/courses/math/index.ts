import { Course } from '@/base-course/Course';
import { SingleDigitAdditionQuestion } from '@/courses/math/questions/addition';
import { SingleDigitDivisionQuestion } from '@/courses/math/questions/division';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { EqualityTest } from './questions/equalityTest';
import { OneStepEquation } from './questions/oneStepEqn';
import { AngleCategorize } from './questions/angleCategorize';

const math: Course = new Course('math',
    [
        SingleDigitDivisionQuestion,
        SingleDigitMultiplicationQuestion,
        SingleDigitAdditionQuestion,
        EqualityTest,
        OneStepEquation,
        AngleCategorize
    ]);

export default math;

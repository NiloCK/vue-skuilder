import { SCourse } from '@/base-course/Course';
import { SingleDigitAdditionQuestion } from '@/courses/math/questions/addition';
import { SingleDigitDivisionQuestion } from '@/courses/math/questions/division';
import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { EqualityTest } from './questions/equalityTest';

const math: SCourse = new SCourse('math',
    [
        SingleDigitDivisionQuestion,
        SingleDigitMultiplicationQuestion,
        SingleDigitAdditionQuestion,
        EqualityTest
    ]);

export default math;

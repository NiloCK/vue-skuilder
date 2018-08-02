import { Course } from '@/base-course/Course';
// import { SingleDigitMultiplicationQuestion } from '@/courses/math/questions/multiplication';
import { AudioParsingQuestion } from './questions/audioparse';

const french: Course = new Course('french', [
    AudioParsingQuestion
]);

export default french;

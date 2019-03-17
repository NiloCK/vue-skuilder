import { Course } from '@/base-course/Course';
import { AudioParsingQuestion } from './questions/audioparse';
import { VocabQuestion } from './questions/vocab';

const french: Course = new Course('french', [
    AudioParsingQuestion,
    VocabQuestion
]);

export default french;

import { Course } from '../../base-course/Course';
import { SpellingQuestion } from './questions/spelling';

const wordWork: Course = new Course('wordWork', [SpellingQuestion]);

export default wordWork;

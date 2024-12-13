// vue/src/courses/typing/index.ts
import { Course } from '../../base-course/Course';
import { TypeLetterQuestion } from './questions/single-letter';

let typing: Course = new Course('typing', [TypeLetterQuestion]);

export default typing;

import { Course } from '@/base-course/Course';
import { EchoQuestion } from './questions/echo';

const piano: Course = new Course('piano', [
  EchoQuestion
]);

export default piano;

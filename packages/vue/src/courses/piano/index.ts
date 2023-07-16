import { Course } from '../../base-course/Course';
import { EchoQuestion } from './questions/echo';
import { PlayNote } from './questions/playNote';

const piano: Course = new Course('piano', [EchoQuestion, PlayNote]);

export default piano;

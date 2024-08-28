import { Course } from '../../base-course/Course';
import { Puzzle } from './questions/puzzle';

const chess: Course = new Course('chess', [Puzzle]);

export default chess;

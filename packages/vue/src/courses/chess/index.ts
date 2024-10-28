import { Course } from '../../base-course/Course';
import { ChessPuzzle } from './questions/puzzle';

const chess: Course = new Course('chess', [ChessPuzzle]);

export default chess;

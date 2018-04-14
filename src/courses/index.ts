import math from './math';
import { Course } from '@/base-course/Course';

interface CourseList {
    [index: string]: Course;
}

const courseList: CourseList = {
    math
};

export default courseList;

import { Course } from '@/base-course/Course';
import math from './math';
import wordWork from './word-work';

export interface CourseList {
    [index: string]: Course;
}

export function getViews(courses: CourseList) {
    const ret: any = {};
    Object.keys(courses).forEach((course) => {
        // alert(`Course: ${JSON.stringify(course)}`);
        courses[course].viewableTypes.forEach((type) => {
            // alert(`dataShape type: ${type.name}`);
            type.dataShape.views.forEach((view) => {
                if (view) {
                    // alert(JSON.stringify(view));
                    ret[view.name] = view.name;
                }
            });
        });
    });

    return ret;
}

const courseList: CourseList = {
    math,
    wordWork
};

export default courseList;

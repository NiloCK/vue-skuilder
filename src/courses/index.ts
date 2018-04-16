import math from './math';
import { Course } from '@/base-course/Course';

export interface CourseList {
    [index: string]: Course;
}

export function getViews(courses: CourseList) {
    const ret: any = {};
    Object.keys(courses).forEach( (course) => {
        // alert(`Course: ${JSON.stringify(course)}`);
        courses[course].viewableTypes.forEach( (type) => {
            // alert(`dataShape type: ${type.name}`);
            type.dataShape.views.forEach( (view) => {
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
    math
};

export default courseList;

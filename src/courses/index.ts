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

export function getView(courses: CourseList, viewStr: string){
    const view: ViewDescriptor = getViewDescriptor(viewStr);
    
    const course = courses[view.course];

    if (course) {
        const dataShape = course.viewableTypes.find( (dataShape) => {
            return dataShape.name === view.dataShape
        });

        if (dataShape) {
            const dataView = dataShape.dataShape.views.find( (dataView) => {
                return dataView.name === view.view;
            });

            if (dataView){
                return dataView;
            } else {
                throw `View ${view.view} not found. ${viewStr} appears to be invalid.`;
            }

        } else {
            throw `dataShape ${view.dataShape} not found. ${viewStr} appears to be invalid.`;
        }
    } else {
        throw `Course ${view.course} not found. ${viewStr} appears to be invalid.`;
    }

}
function getViewDescriptor(viewStr: string): ViewDescriptor{
    const splitArray = viewStr.split('.');

    if (splitArray.length != 3){
        throw "viewStr not valid";
    } else {
        return {
            course: splitArray[0],
            dataShape: splitArray[1],
            view: splitArray[2]
        };
    }
}

interface ViewDescriptor {
    course: string,
    dataShape: string,
    view: string
}

export function getCourseDataShapes(courses: CourseList) {
    const ret: any = {};
    Object.keys(courses).forEach( (course) => {
        courses[course].viewableTypes.forEach( (type) => {
            ret[`${course}.dataShapes.${type.name}`] = type.dataShape;
        });
    });
    // alert(JSON.stringify(ret));
    return ret;
}

const courseList: CourseList = {
    math,
    wordWork
};

export default courseList;

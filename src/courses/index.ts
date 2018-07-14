import { Course, SCourse } from '@/base-course/Course';
import french from './french';
import math from './math';
import wordWork from './word-work';
import Vue, { VueConstructor } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';

export interface CourseList {
    [index: string]: Course;
}

export class SCourseList {
    private readonly courseList: SCourse[];

    public get courses(): SCourse[] {
        return this.courseList;
    }

    constructor(courses: SCourse[]) {
        this.courseList = courses;
    }

    public getCourse(name: string): SCourse | undefined {
        return this.courseList.find((course) => {
            return course.name === name;
        });
    }

    /**
     * allViews supplies the CardViewer component with the required
     * Vue components it needs at run-time.
     */
    public allViews(): { [index: string]: VueConstructor<Vue> } {
        const ret: { [index: string]: VueConstructor<Vue> } = {};

        this.courseList.forEach((course) => {
            Object.assign(ret, course.allViewsMap);
        });

        return ret;
    }

    public getView(viewDescription: ViewDescriptor | string): VueConstructor<Vue> {

        let description: ViewDescriptor;
        if (typeof viewDescription === 'string') {
            description = NameSpacer.getViewDescriptor(viewDescription);
        } else {
            description = viewDescription;
        }

        const course = this.getCourse(description.course);
        if (course) {
            const question = course.getQuestion(description.questionType);
            if (question) {
                const ret = question.views.find((view) => {
                    return view.name === description.view;
                });

                if (ret) {
                    return ret;
                } else {
                    throw new Error(
                        `view ${description.view} does not exist.`
                    );
                }
            } else {
                throw new Error(
                    `question ${description.questionType} does not exist.`
                );
            }
        } else {
            throw new Error(`course ${description.course} does not exist.`);
        }
    }

    public allDataShapes(): ShapeDescriptor[] {
        const ret: ShapeDescriptor[] = [];

        this.courseList.forEach((course) => {
            course.questions.forEach((question) => {
                question.dataShapes.forEach((shape) => {
                    ret.push({
                        course: course.name,
                        dataShape: shape.name
                    });
                })
            });
        });

        return ret;
    }

    public getDataShape(description: ShapeDescriptor): DataShape {
        return this.getCourse(description.course)!
            .getQuestion(description.dataShape)!
            .dataShapes[0];

    }
}

export function getViews(courses: CourseList) {
    const ret: any = {};
    Object.keys(courses).forEach((course) => {
        // alert(`Course: ${JSON.stringify(course)}`);
        courses[course].viewableTypes.forEach((type) => {
            if (type !== undefined) {
                // alert(`dataShape type: ${type.name}`);
                type.views.forEach((view) => {
                    if (view !== undefined) {
                        // alert(JSON.stringify(view));
                        ret[view.name] = view.name;
                    }
                });
            }
        });
    });

    return ret;
}

export function getView(courses: CourseList, viewStr: string) {
    const view: ViewDescriptor = NameSpacer.getViewDescriptor(viewStr);

    const course = courses[view.course];

    if (course) {
        const questionType = course.viewableTypes.find((testDataShape) => {
            return testDataShape.name === view.questionType;
        });

        if (questionType) {
            const dataView = questionType.views.find((testDataView) => {
                return testDataView.name === view.view;
            });

            if (dataView) {
                return dataView;
            } else {
                throw new Error(`View ${view.view} not found. ${viewStr} appears to be invalid.`);
            }

        } else {
            throw new Error(`dataShape ${view.questionType} not found. ${viewStr} appears to be invalid.`);
        }
    } else {
        throw new Error(`Course ${view.course} not found. ${viewStr} appears to be invalid.`);
    }
}

export function getDataShape(courses: CourseList, shapeStr: string) {
    const shape: ShapeDescriptor = NameSpacer.getDataShapeDescriptor(shapeStr);
    const course = courses[shape.course];

    if (course) {
        const dataShape = course.viewableTypes.find((testDataShape) => {
            return testDataShape.name === shape.dataShape;
        });

        if (dataShape) {
            return dataShape;
        } else {
            throw new Error(`Datashape ${shape.dataShape} not found. ${shapeStr} appears to be invalid.`);
        }
    } else {
        throw new Error(`Course ${shape.course} not found. ${shapeStr} appears to be invalid.`);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class NameSpacer {
    public static getDataShapeDescriptor(shapeStr: string): ShapeDescriptor {
        const splitArray = shapeStr.split('.');

        if (splitArray.length !== 3) {
            throw new Error('shapeStr not valid');
        } else {
            return {
                course: splitArray[0],
                dataShape: splitArray[2]
            };
        }
    }
    public static getDataShapeString(shapeDescription: ShapeDescriptor) {
        return `${shapeDescription.course}.datashape.${shapeDescription.dataShape}`;
    }

    public static getViewDescriptor(viewStr: string): ViewDescriptor {
        const splitArray = viewStr.split('.');

        if (splitArray.length !== 4) {
            throw new Error('viewStr not valid');
        } else {
            return {
                course: splitArray[0],
                questionType: splitArray[2],
                view: splitArray[3]
            };
        }
    }

    public static getViewString(viewDescription: ViewDescriptor): string {
        return `${viewDescription.course}.question.` +
            `${viewDescription.questionType}.${viewDescription.view}`;
    }

}

export interface ShapeDescriptor {
    course: string;
    dataShape: string;
}

export interface QuestionDescriptor {
    course: string;
    questionType: string;
}

export interface ViewDescriptor {
    course: string;
    questionType: string;
    view: string;
}

export function getCourseDataShapes(courses: CourseList) {
    const ret: any = {};
    Object.keys(courses).forEach((course) => {
        courses[course].viewableTypes.forEach((type) => {
            if (type !== undefined) {
                ret[`${course}.dataShapes.${type.name}`] = type.dataShapes;
            }
        });
    });
    // alert(JSON.stringify(ret));
    return ret;
}

const courseList: SCourseList = new SCourseList([
    math,
    wordWork,
    french
]);

export default courseList;

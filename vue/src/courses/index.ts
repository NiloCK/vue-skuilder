import { Course } from '@/base-course/Course';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Vue, { VueConstructor } from 'vue';
import french from './french';
import math from './math';
import wordWork from './word-work';
import piano from './piano';
import defaultCourse from './default';

export class CourseList {
    private readonly courseList: Course[];

    public get courses(): Course[] {
        return this.courseList;
    }

    constructor(courses: Course[]) {
        this.courseList = courses;
    }

    public getCourse(name: string): Course | undefined {
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
                    if (ret.findIndex((testShape) => {
                        return testShape.course === course.name &&
                            testShape.dataShape === shape.name;
                    }) === -1) {
                        ret.push({
                            course: course.name,
                            dataShape: shape.name
                        });
                    }
                });
            });
        });

        return ret;
    }

    public getDataShape(description: ShapeDescriptor): DataShape {
        let ret: DataShape | undefined;

        this.getCourse(description.course)!
            .questions.forEach((question) => {
                question.dataShapes.forEach((shape) => {
                    if (shape.name === description.dataShape) {
                        ret = shape;
                    }
                });
            });

        if (ret) {
            return ret;
        } else {
            throw new Error(`DataShape ${NameSpacer.getDataShapeString(description)} not found`);
        }
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

    public static getQuestionDescriptor(questionStr: string): QuestionDescriptor {
        const splitArray = questionStr.split('.');

        if (splitArray.length !== 3) {
            throw new Error('questionStr not valid');
        } else {
            return {
                course: splitArray[0],
                questionType: splitArray[2]
            };
        }
    }

    public static getQuestionString(questionDescription: QuestionDescriptor): string {
        return `${questionDescription.course}.question.${questionDescription.questionType}`;
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

const courseList: CourseList = new CourseList([
    math,
    wordWork,
    french,
    defaultCourse
]);

export default courseList;

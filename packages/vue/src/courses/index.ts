import { Course } from '../base-course/Course';
import { DataShape } from '../base-course/Interfaces/DataShape';
import Vue, { VueConstructor } from 'vue';
import french from './french';
import typing from './typing';
import math from './math';
import wordWork from './word-work';
import piano from './piano';
import chess from './chess';
import defaultCourse from './default';
import Viewable from '../base-course/Viewable';
import { Displayable, ViewComponent } from '../base-course/Displayable';
import pitch from './pitch';
import sightSing from './sightsing';
import { NameSpacer, ShapeDescriptor, ViewDescriptor } from './NameSpacer';

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

  public getView(viewDescription: ViewDescriptor | string): ViewComponent {
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
          console.error(`${description.view} not found in course ${description.course}`);
          throw new Error(`view ${description.view} does not exist.`);
        }
      } else {
        console.error(`${description.questionType} not found in course ${description.course}`);
        throw new Error(`question ${description.questionType} does not exist.`);
      }
    } else {
      console.error(`${description.course} not found.`);
      throw new Error(`course ${description.course} does not exist.`);
    }
  }

  public allDataShapesRaw(): DataShape[] {
    const ret: DataShape[] = [];

    this.courseList.forEach((course) => {
      course.questions.forEach((question) => {
        question.dataShapes.forEach((shape) => {
          if (!ret.includes(shape)) {
            ret.push(shape);
          }
        });
      });
    });

    return ret;
  }

  public allDataShapes(): (ShapeDescriptor & { displayable: typeof Displayable })[] {
    const ret: (ShapeDescriptor & { displayable: typeof Displayable })[] = [];

    this.courseList.forEach((course) => {
      course.questions.forEach((question) => {
        question.dataShapes.forEach((shape) => {
          // [ ] need to de-dup shapes here. Currently, if a shape is used in multiple courses
          //     it will be returned multiple times.
          //     `Blanks` shape is is hard coded into new courses, so gets returned many times
          if (
            ret.findIndex((testShape) => {
              return testShape.course === course.name && testShape.dataShape === shape.name;
            }) === -1
          ) {
            ret.push({
              course: course.name,
              dataShape: shape.name,
              displayable: question,
            });
          }
        });
      });
    });

    return ret;
  }

  public getDataShape(description: ShapeDescriptor): DataShape {
    let ret: DataShape | undefined;

    this.getCourse(description.course)!.questions.forEach((question) => {
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

const courseList: CourseList = new CourseList([
  math,
  wordWork,
  french,
  defaultCourse,
  piano,
  pitch,
  sightSing,
  chess,
  typing,
]);

export default courseList;

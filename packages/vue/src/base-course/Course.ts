import { Displayable } from '../base-course/Displayable';
import Vue, { VueConstructor } from 'vue';
import defaultCourse from '../courses/default';
import { BlanksCard } from '../courses/default/questions/fillIn/';

// tslint:disable-next-line:max-classes-per-file
export class Course {
  public get questions(): Array<typeof Displayable> {
    return this.questionList;
  }

  public get allViews(): Array<VueConstructor<Vue>> {
    const ret = new Array<VueConstructor<Vue>>();

    this.questionList.forEach((question) => {
      question.views.forEach((view) => {
        ret.push(view);
      });
    });

    return ret;
  }

  /**
   * This function returns the map {[index:string]: string} of display
   * components needed by the CardViewer component
   */
  public get allViewsMap(): { [index: string]: VueConstructor<Vue> } {
    const ret: { [index: string]: VueConstructor<Vue> } = {};

    this.allViews.forEach((view) => {
      ret[view.name] = view;
    });

    return ret;
  }
  public readonly name: string;
  private readonly questionList: Array<typeof Displayable>;

  constructor(name: string, questionList: Array<typeof Displayable>) {
    this.name = name;
    this.questionList = questionList;

    this.questionList = this.questionList.concat(this.getBaseQTypes());
  }

  public getQuestion(name: string): typeof Displayable | undefined {
    return this.questionList.find((question) => {
      return question.name === name;
    });
  }

  public getBaseQTypes(): Array<typeof Displayable> {
    // #145 todo: return [BasicCard];
    // should: get 'default' course displayable types
    // return defaultCourse.getBaseQTypes();
    return [BlanksCard];
  }
}

import Vue, { VueConstructor } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import Viewable from './Viewable';

export interface Answer {}

// tslint:disable-next-line:max-classes-per-file
export abstract class Displayable {
  public static dataShapes: DataShape[];

  public static views: Array<VueConstructor<Viewable>>;
  public static seedData?: Array<any>;
  /**
   * True if this displayable content type is meant to have
   * user-submitted questions. False if supplied seedData array
   * is comprehensive for the content type. EG, a SingleDigitAddition
   * type may comprehensively supply 0+0,0+1,...,9+9 as its seed
   * data, and not want any user input.
   */
  public static acceptsUserData: boolean = true;

  /**
   *
   */
  constructor(viewData: ViewData[]) {
    if (viewData.length === 0) {
      throw new Error(`
Displayable Constructor was called with no view Data.
            `);
    }
    validateData(this.dataShapes(), viewData);
  }

  public abstract dataShapes(): DataShape[];
  public abstract views(): Array<VueConstructor<Viewable>>;
}

function validateData(shape: DataShape[], data: ViewData[]) {
  for (let i = 0; i < shape.length; i++) {
    shape[i].fields.forEach((field) => {
      if (data[i][field.name] === undefined) {
        throw new Error(`field validation failed: ${field.name}`);
      }
    });
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class Question extends Displayable {
  public abstract isCorrect(answer: Answer): boolean;
}

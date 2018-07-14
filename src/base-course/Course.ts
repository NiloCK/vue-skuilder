import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import Vue, { VueConstructor } from 'vue';

export abstract class Answer { }

// tslint:disable-next-line:max-classes-per-file
export abstract class Displayable {
    public static dataShapes: DataShape[];

    public static views: Array<VueConstructor<Vue>>;

    /**
     *
     */
    constructor(viewData: ViewData[]) {
        validateData(this.dataShapes(), viewData);
    }

    public abstract dataShapes(): DataShape[];
    public abstract views(): Array<VueConstructor<Vue>>;
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

export interface Course {
    viewableTypes: Array<typeof Question>;
}

// tslint:disable-next-line:max-classes-per-file
export class SCourse {
    public readonly name: string;
    private readonly questionList: Array<typeof Question>;

    public get questions(): Array<typeof Question> {
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
    public get allViewsMap(): { [index: string]: string } {
        const ret: { [index: string]: string } = {};

        this.allViews.forEach((view) => {
            ret[view.name] = view.name;
        });

        return ret;
    }

    constructor(name: string, questionList: Array<typeof Question>) {
        this.name = name;
        this.questionList = questionList;
    }

    public getQuestion(name: string): [boolean, typeof Question | null] {
        const index = this.questionList.findIndex((question) => {
            return question.name === name;
        });

        if (index !== -1) {
            return [true, this.questionList[index]];
        } else {
            return [false, null];
        }
    }

}

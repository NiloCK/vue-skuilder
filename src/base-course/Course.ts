import { DataShape } from '@/base-course/Interfaces/DataShape';
import { ViewData } from '@/base-course/Interfaces/ViewData';
// import BasicCard from '@/base-course/CardTypes/BasicCard';
import Vue, { VueConstructor } from 'vue';
import BasicCard, { CardTypes } from '@/base-course/CardTypes/BasicCard';
import { Displayable } from '@/base-course/Displayable';



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

        this.questionList.concat(this.getBaseQTypes());
    }

    public getQuestion(name: string): typeof Displayable | undefined {
        return this.questionList.find((question) => {
            return question.name === name;
        });
    }

    private getBaseQTypes(): Array<typeof Displayable> {
        return [BasicCard];
    }

}

import { Displayable, Question } from '@/base-course/Course';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { QuestionRecord } from '@/db/types';
import moment from 'moment';
import MouseTrap from 'mousetrap';
import { Prop, Vue } from 'vue-property-decorator';

// @Component
export default abstract class Viewable extends Vue {
    @Prop() public data: ViewData[];
    protected startTime: moment.Moment;
    protected MouseTrap: MousetrapInstance = new MouseTrap(this.$el);

    public created() {
        this.startTime = moment();
    }
    /**
     * Returns the time in milliseconds since the element was created
     */
    public getTime(): number {
        return moment().diff(this.startTime, 'milliseconds');
    }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class QuestionView<Q extends Question> extends Viewable {
    protected attempts: number = 1; // starts at the 1st attempt
    public abstract get question(): Q;

    protected grade(): QuestionRecord {
        return {
            course: '',
            attempts: this.attempts,
            cardID: 'thisisanid',
            isCorrect: this.question.isCorrect('hi'),
            time: this.getTime(),
            userAnswer: 'hi'
        };
    }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class InformationView<D extends Displayable> extends Viewable {
    // is there anything to do here?
}

import { Displayable, Question, Answer } from '@/base-course/Displayable';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import { QuestionRecord, CardRecord } from '@/db/types';
import moment, { duration } from 'moment';
import MouseTrap from 'mousetrap';
import { Prop, Vue } from 'vue-property-decorator';
import { log } from 'util';

// @Component
export default abstract class Viewable extends Vue {
    @Prop() public data: ViewData[];
    protected startTime: moment.Moment = moment.utc();
    protected MouseTrap: MousetrapInstance = new MouseTrap(this.$el);

    /**
     * Returns the time in milliseconds since the element was created
     */
    public get timeSpent(): number {
        return Math.abs(moment.utc().diff(this.startTime, 'milliseconds'));
    }

    /**
     * Returns a URL for accessing Blob data. Eg: if the Nth dataShape
     * of a view has an image field named 'wordImage', then this image
     * can be displayed in a template as:
     *
     * <img :src="getURL('wordImage', N)" />
     * @param item The name of the item
     * @param dataShapeIndex The index of the viewData that contains the item.
     */
    protected getURL(item: string, dataShapeIndex: number = 0): string {
        if (this.data[dataShapeIndex][item]) {
            return URL.createObjectURL(this.data[dataShapeIndex][item]);
        } else {
            return '';
        }
    }

    /**
     * Called when a user is finished with a card, and triggers
     * the display of new content.
     */
    protected emitResponse(r: CardRecord) {
        this.$emit('emitResponse', r);
    }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class QuestionView<Q extends Question> extends Viewable {
    protected priorAttempts: number = 0; // starts at the 1st attempt
    public abstract get question(): Q;

    public submitAnswer(answer: Answer) {
        log('QuestionView.submitAnswer called...');
        const isCorrect = this.question.isCorrect(answer);

        const record: QuestionRecord = {
            priorAttemps: this.priorAttempts,
            cardID: '',
            isCorrect,
            timeSpent: this.timeSpent,
            timeStamp: this.startTime,
            userAnswer: answer
        };

        if (!isCorrect) {
            this.priorAttempts++;
        }
        this.emitResponse(record);
    }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class InformationView<D extends Displayable> extends Viewable {
    // is there anything to do here?
    public abstract get displayable(): D;
}

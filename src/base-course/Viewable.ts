import { Component, Prop, Vue } from 'vue-property-decorator';
import { DisplayableData, QuestionRecord } from '@/db/types';
import moment from 'moment';
import { Question, Displayable } from '@/base-course/Course';

// @Component
export default abstract class Viewable extends Vue {
  @Prop() public data: any;
  protected startTime: moment.Moment;

  public created() {
    this.startTime = moment();
  }
  /**
   * Returns the time in MS since the element was created
   */
  public getTime(): number {
    return moment().diff(this.startTime, 'milliseconds');
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class QuestionView<Q extends Question> extends Viewable {
    protected attempts: number = 1; // starts at the 1st attempt
    abstract get question(): Q;

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

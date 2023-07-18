import { Displayable, Question, Answer } from '../base-course/Displayable';
import { ViewData } from '../base-course/Interfaces/ViewData';
import { QuestionRecord, CardRecord } from '../db/types';
import moment, { duration } from 'moment';
import MouseTrap from 'mousetrap';
import { Prop, Vue } from 'vue-property-decorator';
import { log } from 'util';
import { HotKey } from '../SkldrMouseTrap';

/**
 * Base class for card views in courses.
 */
export default abstract class Viewable extends Vue {
  @Prop() public data: ViewData[];
  public toString(): string {
    return '!!! preview not implemented !!!';
  }
  protected startTime: moment.Moment = moment.utc();
  protected MouseTrap = new MouseTrap(this.$el);
  public hotKeys: HotKey[] = [];

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
      return URL.createObjectURL(this.data[dataShapeIndex][item] as any);
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

/**
 * Base class for question views in courses.
 */
// tslint:disable-next-line:max-classes-per-file
export abstract class QuestionView<Q extends Question> extends Viewable {
  static seedData: any[];

  protected priorSessionViews: number = 0;
  protected priorAttempts: number = 0; // starts at the 1st attempt
  public abstract get question(): Q;

  /**
   * The maximum number of times that a card with this view type can
   * be presented to a learner in one study session (to avoid burnout
   * on too-hard content)
   */
  public maxSessionViews: number = 1;
  public maxAttemptsPerView: number = 3;

  public submitAnswer(answer: Answer): QuestionRecord {
    log('QuestionView.submitAnswer called...');
    const evaluation = this.question.evaluate(answer, this.timeSpent);

    const record: QuestionRecord = {
      ...evaluation,
      priorAttemps: this.priorAttempts,
      courseID: '',
      cardID: '',
      timeSpent: this.timeSpent,
      timeStamp: this.startTime,
      userAnswer: answer,
    };

    if (!evaluation.isCorrect) {
      this.priorAttempts++;
    }
    this.emitResponse(record);
    return record;
  }
}

// tslint:disable-next-line:max-classes-per-file
export abstract class InformationView<D extends Displayable> extends Viewable {
  // is there anything to do here?
  public abstract get displayable(): D;
}

export function isQuestionView(v: Viewable): v is QuestionView<any> {
  return (v as QuestionView<any>).submitAnswer !== undefined;
}

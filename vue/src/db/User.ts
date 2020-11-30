import { Moment } from 'moment';

export interface ScheduledCard {
  _id: PouchDB.Core.DocumentId;

  /**
   * The docID of the card to be reviewed
   */
  cardId: PouchDB.Core.DocumentId;
  /**
   * The ID of the course
   */
  courseId: string;
  /**
   * The time at which the card becomes eligible for review.
   *
   * (Should probably be UTC adjusted so that performance is
   * not wonky across time zones)
   */
  reviewTime: Moment;

  /**
   * The time at which this scheduled event was created.
   */
  scheduledAt: Moment;

  /**
   * Classifying whether this card is scheduled on behalf of a
   * user-registered course or by as assigned content from a
   * user-registered classroom
   */
  scheduledFor: 'course' | 'classroom';

  /**
   * The ID of the course or classroom that requested this card
   */
  schedulingAgentId: string;
}

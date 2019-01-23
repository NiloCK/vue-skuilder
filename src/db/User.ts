import { Moment } from "moment";

export class User {
  email: string;
  username: string;

  courseRegistrations: string[];

  scheduledCards: ScheduledCard[];
}

export interface ScheduledCard {
  _id: PouchDB.Core.DocumentId;

  /**
   * The docID of the card to be reviewed
   */
  cardId: PouchDB.Core.DocumentId;
  /**
   * The ID of the course
   */
  // courseId: string; // this will be relevant if/when per-course dbs are implemented

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
}
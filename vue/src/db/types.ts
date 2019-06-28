import { Answer } from '@/base-course/Displayable';
import { Moment } from 'moment';

export enum DocType {
    DISPLAYABLE_DATA = 'DISPLAYABLE_DATA',
    CARD = 'CARD',
    DATASHAPE = 'DATASHAPE',
    QUESTIONTYPE = 'QUESTION',
    VIEW = 'VIEW',
    PEDAGOGY = 'PEDAGOGY',
    CARDRECORD = 'CARDRECORD',
    SCHEDULED_CARD = 'SCHEDULED_CARD'
}

/**
 * Interface for all data on course content and pedagogy stored
 * in the c/pouch database.
 */
export interface SkuilderCourseData {
    course: string;
    docType: DocType;
}
export interface CardData extends SkuilderCourseData {
    // DocType.CARD
    id_displayable_data: PouchDB.Core.DocumentId[];
    id_view: PouchDB.Core.DocumentId;
}

/** A list of populated courses in the DB */
export interface CourseListData extends PouchDB.Core.Response {
    courses: string[];
}

/**
 * The data used to hydrate viewable components (questions, info, etc)
 */
export interface DisplayableData extends SkuilderCourseData {
    // DocType.DISPLAYABLE_DATA
    author?: string;
    id_datashape: PouchDB.Core.DocumentId;
    data: Field[];
    _attachments?: { [index: string]: PouchDB.Core.FullAttachment };
}

export interface Field {
    data: any;
    name: string;
}

export interface DataShapeData extends SkuilderCourseData {
    _id: PouchDB.Core.DocumentId;
    questionTypes: PouchDB.Core.DocumentId[];
}

export interface QuestionData extends SkuilderCourseData {
    _id: PouchDB.Core.DocumentId;
    viewList: string[];
    dataShapeList: PouchDB.Core.DocumentId[];
}

const cardHistoryPrefix = 'cardH';

export function getCardHistoryID(courseID: string, cardID: string):
    PouchDB.Core.DocumentId {
    return `${cardHistoryPrefix}-${courseID}-${cardID}`;
}

export function parseCardHistoryID(id: string): {
    courseID: string,
    cardID: string
} {
    const split = id.split('-');
    let error: string = '';
    error += split.length === 3 ?
        '' :
        `\n\tgiven ID has incorrect number of '-' characters`;
    error += split[0] === cardHistoryPrefix ?
        '' :
        `\n\tgiven ID does not start with ${cardHistoryPrefix}`;

    if (split.length === 3 &&
        split[0] === cardHistoryPrefix) {
        return {
            courseID: split[1],
            cardID: split[2]
        }
    } else {
        throw new Error('parseCardHistory Error:' + error);
    }
}

export interface CardHistory<T extends CardRecord> {
    _id: PouchDB.Core.DocumentId;
    /**
     * The CouchDB id of the card
     */
    cardID: PouchDB.Core.DocumentId;

    /**
     * The ID of the course
     */
    courseID: string;

    records: T[];
}

export interface CardRecord {
    /**
     * The CouchDB id of the card
     */
    cardID: string;
    /**
     * The ID of the course
     */
    courseID: string;
    /**
     * Number of milliseconds that the user spent before dismissing
     * the card (ie, "I've read this" or "here is my answer")
     */
    timeSpent: number;
    /**
     * The date-time that the card was rendered. timeStamp + timeSpent will give the
     * time of user submission.
     */
    timeStamp: Moment;
}

export interface QuestionRecord extends CardRecord {
    userAnswer: Answer;
    isCorrect: boolean;
    /**
     * The number of incorrect user submissions prededing this submisstion.
     *
     * eg, if a user is asked 7*6=__, submitting 46, 48, 42 will result in three
     * records being created having 0, 1, and 2 as their
     */
    priorAttemps: number;
}

export function isQuestionRecord(c: CardRecord): c is QuestionRecord {
    return (c as QuestionRecord).userAnswer !== undefined;
}

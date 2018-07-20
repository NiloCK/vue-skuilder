import { Answer } from '@/base-course/Course';
import { Moment } from 'moment';

export enum DocType {
    DISPLAYABLE_DATA = 'DISPLAYABLE_DATA',
    CARD = 'CARD',
    DATASHAPE = 'DATASHAPE',
    QUESTIONTYPE = 'QUESTION',
    VIEW = 'VIEW',
    PEDAGOGY = 'PEDAGOGY'
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
    id_datashape: PouchDB.Core.DocumentId;
    data: Field[];
}

export interface Field {
    data: any;
    name: string;
}

/**
 * The name of a defined interface for ctor args of a question type or viewable type
 */
export type NoteCtor = string;

export interface DataShapeData extends SkuilderCourseData {
    _id: PouchDB.Core.DocumentId;
    questionTypes: PouchDB.Core.DocumentId[];
}

export interface QuestionData extends SkuilderCourseData {
    _id: PouchDB.Core.DocumentId;
    viewList: string[];
    dataShapeList: PouchDB.Core.DocumentId[];
}

export interface CardRecord {
    /**
     * The CouchDB id of the card
     */
    cardID: string;
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

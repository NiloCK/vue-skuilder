import { Answer } from '@/base-course/Course';

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

export interface QuestionRecord {
    course: string;
    cardID: string;
    userAnswer: Answer;
    isCorrect: boolean;
    attempts: number;
    time: number;
}

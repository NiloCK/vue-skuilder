import { Answer, DataShape } from '@/base-course/Course';

export enum DocType {
    DISPLAYABLE_DATA,
    CARD,
    DATASHAPE,
    VIEW,
    PEDAGOGY
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
    id_displayable_data: PouchDB.Core.DocumentId;
    id_view: PouchDB.Core.DocumentId;
}

/** A list of populated courses in the DB */
export interface CourseListData extends PouchDB.Core.Response {
    courses: string[];
}

/**
 * The name of a Viewable component in a skuilder course
 */
export type VueComponentName = string;
export interface ViewData extends SkuilderCourseData {
    // DocType.VIEW
    id_datashape: PouchDB.Core.DocumentId;
    name: VueComponentName;
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

export interface DataShapeData extends SkuilderCourseData, DataShape {
    // DocType.DATASHAPE
}

export interface FieldDefinition {
    name: string;
    type: FieldType;
}

export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int'
}

export interface QuestionRecord {
    course: string;
    cardID: string;
    userAnswer: Answer;
    isCorrect: boolean;
    attempts: number;
    time: number;
}

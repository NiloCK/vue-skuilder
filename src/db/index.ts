import pouch from 'pouchdb-browser';
import * as PouchDBFind from 'pouchdb-find';
import PouchDBAuth from 'pouchdb-authentication';
import { Answer } from '@/courses/base/Course';

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

const databaseName = 'record';
const remote: PouchDB.Database = new pouch(
    'http://localhost:5984/math/',
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

interface PouchData extends PouchDB.Core.IdMeta, PouchDB.Core.GetMeta {
    data: string[];
}

enum DocType {
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
interface SkuilderCourseData extends PouchDB.Core.IdMeta, PouchDB.Core.GetMeta {
    course: string;
    docType: DocType;
}
interface CardData extends SkuilderCourseData {
    // DocType.CARD
    id_displayable_data: PouchDB.Core.DocumentId;
    id_view: PouchDB.Core.DocumentId;
}

/**
 * The name of a Viewable component in a skuilder course
 */
type VueComponentName = string;
interface ViewData extends SkuilderCourseData {
    // DocType.VIEW
    id_datashape: PouchDB.Core.DocumentId;
    name: VueComponentName;
}

/**
 * The data used to hydrate viewable components (questions, info, etc)
 */
interface DisplayableData extends SkuilderCourseData {
    // DocType.DISPLAYABLE_DATA
    id_datashape: PouchDB.Core.DocumentId;
    data: Field[];
}

interface Field {
    data: any;
    name: string;
}

/**
 * The name of a defined interface for ctor args of a question type or viewable type
 */
type ViewableTypeCtor = string;
interface DataShapeData extends SkuilderCourseData {
    // DocType.DATASHAPE
    name: ViewableTypeCtor;
    fields: FieldDefinition[];
}

interface FieldDefinition {
    name: string;
    type: FieldType;
}

enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int'
}

export function testDataRetrieval(): Promise<PouchData> {
    return remote.get<PouchData>('testData');
}

export function getCourseDatabase(courseName: string): PouchDB.Database {
    return new pouch(
        'https://nilock.cloudant.com/' + courseName,
        {
            skip_setup: true
        }
    );
}

export function getCourseQuestions(courseName: string) {
    const db = getCourseDatabase(courseName);
    return db.find({
        fields: ['type'],
        selector: { name: 'viewList' }
    });
}

export interface QuestionRecord {
    courseID: string;
    cardID: string;
    userAnswer: Answer;
    isCorrect: boolean;
    attempts: number;
    time: number;
}

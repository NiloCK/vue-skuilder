import * as pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAuth from 'pouchdb-authentication';
import { Answer } from '@/courses/base/Course';

pouch.plugin(require(PouchDBAuth));
pouch.plugin(require(PouchDBFind));

const databaseName = "record";
const remote: PouchDB.Database = new pouch(
    'https://nilock.cloudant.com/math',
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

export function getCourseDatabase(courseName: String): PouchDB.Database {
    return new pouch(
        "https://nilock.cloudant.com/" + courseName,
        {
            skip_setup: true
        }
    )
}

export function getCourseQuestions(courseName: string) {
    let db = getCourseDatabase(courseName);
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

enum CourseDataTypes {
    DATA = "data",
    CARD = "card",
    VIEWLIST = "viewList"
}

interface DocID {
    id: string;
}

interface CourseData {
    type: CourseDataTypes;
}

interface QuestionData extends CourseData {

}

interface ViewList extends CourseData {
    questionType: string;
    viewList: Array<string>;
}

interface Card extends CourseData {
    data: DocID;
    view: string;
}
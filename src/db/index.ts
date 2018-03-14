import pouch from 'pouchdb-browser';
import * as PouchDBFind from 'pouchdb-find';
import PouchDBAuth from 'pouchdb-authentication';
import { Answer } from '@/courses/base/Course';

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

const databaseName = "record";
const remote: PouchDB.Database = new pouch(
    'http://localhost:5984/math/',
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

interface PouchData extends PouchDB.Core.IdMeta, PouchDB.Core.GetMeta {
    data: string[]
}

export function testDataRetrieval(): Promise<PouchData> {
    return remote.get<PouchData>("c782b919c68ca62ff987d8ffa3001bd7");
}

let a;
testDataRetrieval().then(info => {
    a = info.data
})

export function getCourseDatabase(courseName: String): PouchDB.Database {
    return new pouch(
        "https://nilock.cloudant.com/" + courseName,
        {
            skip_setup: true
        }
    )
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
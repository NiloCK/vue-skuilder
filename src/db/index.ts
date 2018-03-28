import pouch from 'pouchdb-browser';
import * as PouchDBFind from 'pouchdb-find';
import PouchDBAuth from 'pouchdb-authentication';
import { Answer } from '@/courses/base/Course';
import { CourseListData } from '@/db/types';

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

const databaseName = 'record';
const remote: PouchDB.Database = new pouch(
    'http://localhost:5984/skuilder/',
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

/**
 *
 */
export async function getCourseList(): Promise<CourseListData> {
    // try {
    //     const ret = await remote.get<CourseListData>('courses');
    //     return ret;
    // } catch {
    //     // tslint:disable-next-line:no-console
    //     console.log('hi');
    // }
    // // const ret = await remote.get<CourseListData>('bourses');
    // // if (ret.courses) {
    // //     return ret;
    // // } else {
    // //     // tslint:disable-next-line:no-console
    // //     console.log('hello');
    // // }
    return remote.get<CourseListData>('courses');
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

import hashids from 'hashids';
import { docCount, useOrCreateDB } from '../app';
import CouchDB from '../couchdb';
import AsyncProcessQueue, { Result } from '../utils/processQueue';
import { CreateCourse, DeleteCourse } from '../../../vue/src/server/types';

const COURSE_DB_LOOKUP = 'coursedb-lookup';
const courseHasher = new hashids(
    COURSE_DB_LOOKUP,
    6,
    'abcdefghijkmnopqrstuvwxyz23456789'
);

async function createCourse(cfg: CreateCourse['data']): Promise<any> {
    const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);
    const num = await docCount(COURSE_DB_LOOKUP) + 1;
    const uuid = (await CouchDB.uuids(1)).uuids[0];

    const courseID = courseHasher.encode(num);

    const lookupInsert = await lookup.insert({
        _id: courseID,
        ...cfg
    });

    const courseDBName: string = `coursedb-${courseID}`;
    const dbCreation = await CouchDB.db.create(courseDBName);

    if (dbCreation) {
        const courseDB = CouchDB.use(courseDBName);
        courseDB.insert({
            _id: 'CourseConfig',
            ...cfg
        });
    };

    return {
        ok: lookupInsert.ok && dbCreation.ok,
        status: "ok",
        courseID: courseID
    };
}

export const CourseCreationQueue = new AsyncProcessQueue<
    CreateCourse['data'],
    CreateCourse['response']
>(createCourse);

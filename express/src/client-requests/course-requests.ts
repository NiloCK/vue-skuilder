import hashids from 'hashids';
import { docCount, useOrCreateDB } from '../app';
import CouchDB from '../couchdb';
import AsyncProcessQueue, { Result } from '../utils/processQueue';
import { CreateCourse, DeleteCourse } from '../../../vue/src/server/types';
import nano = require('nano');
import { postProcessCourse } from '../attachment-preprocessing';

export const COURSE_DB_LOOKUP = 'coursedb-lookup';
const courseHasher = new hashids(
    COURSE_DB_LOOKUP,
    6,
    'abcdefghijkmnopqrstuvwxyz23456789'
);

async function createCourse(cfg: CreateCourse['data']): Promise<any> {
    const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);

    const lookupInsert = await lookup.insert({
        ...cfg
    } as nano.MaybeDocument);
    const courseID = lookupInsert.id;

    const courseDBName: string = `coursedb-${courseID}`;
    const dbCreation = await CouchDB.db.create(courseDBName);

    if (dbCreation) {
        const courseDB = CouchDB.use(courseDBName);
        courseDB.insert({
            _id: 'CourseConfig',
            ...cfg
        });
    };

    // follow the course so that user-uploaded content goes through
    // post-processing
    postProcessCourse(courseID);

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

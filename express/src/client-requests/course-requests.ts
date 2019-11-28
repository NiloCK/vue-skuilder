import hashids from 'hashids';
import { docCount, useOrCreateDB, SecurityObject, courseDBDesignDoc } from '../app';
import CouchDB from '../couchdb';
import AsyncProcessQueue, { Result } from '../utils/processQueue';
import { CreateCourse, DeleteCourse } from '../../../vue/src/server/types';
import nano = require('nano');
import { postProcessCourse } from '../attachment-preprocessing';
import { log } from 'util';


export const COURSE_DB_LOOKUP = 'coursedb-lookup';
const courseHasher = new hashids(
    COURSE_DB_LOOKUP,
    6,
    'abcdefghijkmnopqrstuvwxyz23456789'
);

function getCourseDBName(courseID: string): string {
    return `coursedb-${courseID}`;
}

export async function initCourseDBDesignDocInsert() {
    const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);
    lookup.list((err, body) => {
        if (!err) {
            body.rows.forEach((doc) => {
                const courseDB = CouchDB.use(getCourseDBName(doc.id));
                courseDB.insert(JSON.parse(courseDBDesignDoc)).catch((e) => {
                    log(`Error inserting course design doc for course-${doc.id}:
    ${e}`);
                }).then(() => {
                    log(`Course design doc inserted into course-${doc.id}`);
                });
            });
        }
    });
}

type CourseConfig = CreateCourse['data'];

async function createCourse(cfg: CourseConfig): Promise<any> {
    const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);

    const lookupInsert = await lookup.insert({
        ...cfg
    } as nano.MaybeDocument);
    const courseID = lookupInsert.id;
    cfg.courseID = courseID;

    const courseDBName: string = getCourseDBName(courseID);
    const dbCreation = await CouchDB.db.create(courseDBName);

    if (dbCreation.ok) {
        const courseDB = CouchDB.use(courseDBName);

        courseDB.insert({
            _id: 'CourseConfig',
            ...cfg
        });

        courseDB.insert(JSON.parse(courseDBDesignDoc));

        if (!cfg.public) {
            const secObj: SecurityObject = {
                admins: {
                    names: [],
                    roles: []
                },
                members: {
                    names: [cfg.creator],
                    roles: []
                }
            }

            courseDB.insert(secObj as nano.MaybeDocument, '_security');
        }
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

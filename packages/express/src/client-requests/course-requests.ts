import hashids from 'hashids';
import { log } from 'util';
import { CreateCourse } from '../../../vue/src/server/types';
import { courseDBDesignDoc, SecurityObject, useOrCreateDB } from '../app';
import { postProcessCourse } from '../attachment-preprocessing';
import CouchDB from '../couchdb';
import AsyncProcessQueue from '../utils/processQueue';
import nano = require('nano');
import { emit } from 'cluster';

export const COURSE_DB_LOOKUP = 'coursedb-lookup';
const courseHasher = new hashids(COURSE_DB_LOOKUP, 6, 'abcdefghijkmnopqrstuvwxyz23456789');

function getCourseDBName(courseID: string): string {
  return `coursedb-${courseID}`;
}

const tagsDoc = {
  _id: '_design/getTags',
  views: {
    getTags: {
      map: `function (doc) {
                if (doc.docType && doc.docType === "TAG") {
                    for (var cardIndex in doc.taggedCards) {
                        emit(doc.taggedCards[cardIndex], {
                            docType: doc.docType,
                            name: doc.name,
                            snippit: doc.snippit,
                            wiki: '',
                            taggedCards: []
                        });
                    }
                }
            }`,
      // "mapFcn": function getTags(doc) {
      //     if (doc.docType && doc.docType === "TAG") {
      //         for (var cardIndex in doc.taggedCards) {
      //             emit(doc.taggedCards[cardIndex], {
      //                 docType: doc.docType,
      //                 name: doc.name,
      //                 snippit: doc.snippit,
      //                 wiki: '',
      //                 taggedCards: []
      //             });
      //         }
      //     }
      // }
    },
  },
  language: 'javascript',
};

const elodoc = {
  _id: '_design/elo',
  views: {
    elo: {
      map: `function (doc) {
                if (doc.docType && doc.docType === 'CARD') {
                    if (doc.elo) {
                        emit(doc.elo, doc._id);
                    } else {
                        const randElo = 995 + Math.round(10 * Math.random());
                        emit(randElo, doc._id);
                    }
                }
            }`,
      // "mapFcn": function eloView(doc: any) {
      //     if (doc.docType && doc.docType === 'CARD') {
      //         if (doc.elo) {
      //             emit(doc.elo, doc._id);
      //         } else {
      //             const randElo = 995 + Math.round(10 * Math.random());
      //             emit(randElo, doc._id);
      //         }
      //     }
      // }
    },
  },
  language: 'javascript',
};

function insertDesignDoc(
  courseID: string,
  doc: {
    _id: string;
  }
) {
  const courseDB = CouchDB.use(courseID);

  courseDB
    .get(doc._id)
    .then((priorDoc) => {
      courseDB.insert({
        ...doc,
        _rev: priorDoc._rev,
      });
    })
    .catch((notFound) => {
      courseDB
        .insert(doc)
        .catch((e) => {
          log(`Error inserting design doc ${doc._id} in course-${courseID}`);
        })
        .then((resp) => {
          if (resp && resp.ok) {
            log(`CourseDB design doc inserted into course-${courseID}`);
          }
        });
    });
}

const courseDBDesignDocs: { _id: string }[] = [elodoc, tagsDoc];

export async function initCourseDBDesignDocInsert() {
  const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);
  lookup.list((err, body) => {
    if (!err) {
      body.rows.forEach((courseDoc) => {
        courseDBDesignDocs.forEach((dDoc) => {
          insertDesignDoc(getCourseDBName(courseDoc.id), dDoc);
        });
      });
    }
  });
}

type CourseConfig = CreateCourse['data'];

async function createCourse(cfg: CourseConfig): Promise<any> {
  const lookup = await useOrCreateDB(COURSE_DB_LOOKUP);

  const lookupInsert = await lookup.insert({
    ...cfg,
  } as nano.MaybeDocument);
  const courseID = lookupInsert.id;
  cfg.courseID = courseID;

  const courseDBName: string = getCourseDBName(courseID);
  const dbCreation = await CouchDB.db.create(courseDBName);

  if (dbCreation.ok) {
    const courseDB = CouchDB.use(courseDBName);

    courseDB.insert({
      _id: 'CourseConfig',
      ...cfg,
    });

    // insert the tags, elo, etc view docs
    courseDBDesignDocs.forEach((doc) => {
      courseDB.insert(doc);
    });

    if (!cfg.public) {
      const secObj: SecurityObject = {
        admins: {
          names: [],
          roles: [],
        },
        members: {
          names: [cfg.creator],
          roles: [],
        },
      };

      courseDB.insert(secObj as nano.MaybeDocument, '_security');
    }
  }

  // follow the course so that user-uploaded content goes through
  // post-processing
  postProcessCourse(courseID);

  return {
    ok: lookupInsert.ok && dbCreation.ok,
    status: 'ok',
    courseID: courseID,
  };
}

export const CourseCreationQueue = new AsyncProcessQueue<
  CreateCourse['data'],
  CreateCourse['response']
>(createCourse);

import { Displayable } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import {
  CardData,
  CardHistory,
  CardRecord,
  DataShapeData,
  DisplayableData,
  DocType,
  QuestionData,
  SkuilderCourseData,
  getCardHistoryID
} from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import ENV from '@/ENVIRONMENT_VARS';
import Store, { GuestUsername } from '@/store';
import moment, { Moment } from 'moment';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import process from 'process';
import { log } from 'util';
import { ScheduledCard } from './User';
import { getUserDB, getLocalUserDB } from './userDB';
import _ from 'lodash';

(window as any).process = process; // required as a fix for pouchdb - see #18

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

if (ENV.DEBUG) {
  // pouch.debug.enable('pouchdb:find');
}

const expiryDocID: string = 'GuestAccountExpirationDate';
const dbUUID = 'dbUUID';

const remoteStr: string = ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + 'skuilder';

log(`Remote db: ${remoteStr}`);

export const remote: PouchDB.Database = new pouch(
  remoteStr,
  {
    skip_setup: true
  }
);

const GUEST_LOCALDB = `userdb-${GuestUsername}`;
export const localUserDB: PouchDB.Database = new pouch(GUEST_LOCALDB);

export function hexEncode(str: string): string {
  let hex: string;
  let returnStr: string = '';

  for (let i = 0; i < str.length; i++) {
    hex = str.charCodeAt(i).toString(16);
    returnStr += ('000' + hex).slice(3);
  }

  return returnStr;
}

export const pouchDBincludeCredentialsConfig: PouchDB.Configuration.RemoteDatabaseConfiguration = {
  fetch(url: any, opts: any) {
    opts.credentials = 'include';
    return (pouch as any).fetch(url, opts);
  }
} as PouchDB.Configuration.RemoteDatabaseConfiguration;

function getCouchDB(dbName: string): PouchDB.Database {
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL +
    '://' +
    ENV.COUCHDB_SERVER_URL +
    dbName,
    pouchDBincludeCredentialsConfig
  );
}

export function getCourseDB(courseID: string): PouchDB.Database {
  // todo: keep a cache of opened courseDBs? need to benchmark this somehow
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL +
    '://' +
    ENV.COUCHDB_SERVER_URL +
    'coursedb-' +
    courseID,
    pouchDBincludeCredentialsConfig
  );
}

export async function getLatestVersion() {
  const docs = await getCouchDB('version').allDocs({
    descending: true,
    limit: 1
  });
  if (docs && docs.rows && docs.rows[0]) {
    return docs.rows[0].id;
  } else {
    return '0.0.0';
  }
}

/**
 * Checks the remote couchdb to see if a given username is available
 * @param username The username to be checked
 */
export async function usernameIsAvailable(username: string): Promise<boolean> {
  log(`Checking availability of ${username}`);
  const req = new XMLHttpRequest();
  const url = ENV.COUCHDB_SERVER_URL + 'userdb-' + hexEncode(username);
  req.open('HEAD', url, false);
  req.send();
  return req.status === 404;
}

export function updateGuestAccountExpirationDate(guestDB: PouchDB.Database<{}>) {
  const currentTime = moment.utc();
  const expirationDate: string = currentTime.add(2, 'months').toISOString();

  guestDB.get(expiryDocID).then((doc) => {
    guestDB.put({
      _id: expiryDocID,
      _rev: doc._rev,
      date: expirationDate
    });
  }).catch((err: PouchDB.Core.Error) => {
    guestDB.put({
      _id: expiryDocID,
      date: expirationDate
    });
  });
}


//todo USER - this is to be pruned out when GuestAccomodation is
//            figured out. Moved to class User from userDB.ts.
export function remoteDBSignup(
  username: string,
  password: string,
  options?: PouchDB.Authentication.PutUserOptions) {

  log(`Signing up to remote db:`);

  const newDBRequest = remote.signUp(username, password);

  newDBRequest.then((resp) => {
    if (resp.ok) {
      if (localStorage.dbUUID) {
        // remoteDBLogout().then(() => {
        //   remoteDBLogin(username, password).then(() => {
        //     getLocalUserDB(GuestUsername + localStorage.dbUUID)
        //       .replicate
        //       .to(getUserDB(username));
        //   }).then(() => {
        //     console.log(`deleting local dbUUID`);
        //     delete localStorage.dbUUID;
        //   });
        // });
      }

      localUserDB.get(expiryDocID).then((doc) => {
        return localUserDB.remove(doc._id, doc._rev);
      });
    }
  });

  return newDBRequest;
}

export function getCourseDoc<T extends SkuilderCourseData>(
  courseID: string,
  docID: PouchDB.Core.DocumentId,
  options: PouchDB.Core.GetOptions = {}): Promise<T> {
  return getCourseDB(courseID).get<T>(docID, options);
}

export function getDoc
  <T extends SkuilderCourseData>(id: PouchDB.Core.DocumentId, options: PouchDB.Core.GetOptions = {}): Promise<T> {
  return remote.get<T>(id, options);
}

export async function putQuestionType(course: string, question: typeof Displayable) {
  const questionID = NameSpacer.getQuestionString({
    course,
    questionType: question.name
  });

  const viewList = question.views.map((view) => view.name);

  const dataShapeList = question.dataShapes.map((shape) =>
    NameSpacer.getDataShapeString({
      course,
      dataShape: shape.name
    })
  );

  try {
    await dataShapeList.forEach((id) => {
      getDoc<DataShapeData>(id).
        then((doc) => {
          doc.questionTypes.push(questionID);
          remote.put(doc);
        })
        .catch(() => {
          throw new Error(
            `${id} is not registered in the database.
                    Register dependant dataShapes before registering a question Type.`
          );
        });
    });
  } catch (err) {
    throw err;
  }

  return remote.put<QuestionData>({
    _id: questionID,
    course,
    docType: DocType.QUESTIONTYPE,
    viewList,
    dataShapeList
  });
}

export function getQuestions(course: string) {
  return remote.find({
    selector: {
      docType: DocType.QUESTIONTYPE,
      course
    }
  });
}

export function putDataShape(course: string, dataShape: DataShape) {

  const dataShapeId: string = NameSpacer.getDataShapeString({
    course,
    dataShape: dataShape.name
  });

  return remote.put<DataShapeData>({
    course,
    docType: DocType.DATASHAPE,
    _id: dataShapeId,
    questionTypes: []
  });
}

export function putQuestionView(
  course: string,
  questionName: string,
  viewName: string
) {
  const questionID = NameSpacer.getQuestionString({
    course,
    questionType: questionName
  });

  getDoc<QuestionData>(questionID).then((question) => {
    if (question.viewList.indexOf(viewName) === -1) {
      question.viewList.push(viewName);
      remote.put(question);
    } else {
      throw new Error(
        `putQuestionView failed: ${course}.${questionName} already contains a view named ${viewName}`
      );
    }
  });
}

export async function doesUserExist(name: string) {
  try {
    const user = await remote.getUser(name);
    log(`user: ${user._id}`);
    return true;
  } catch (err) {
    log(`User error: ${err}`);
    return false;
  }
}

async function getImplementingQuestions(dataShape: PouchDB.Core.DocumentId) {
  const shapeResult = await getDoc<DataShapeData>(dataShape);
  const questions = shapeResult.questionTypes;
  return questions.map((question) => {
    return getDoc<QuestionData>(question);
  });
}

/**
 * Returns a promise with doc stubs for all notes of the given dataShape
 * @param course The course name.
 * @param shape The datashape of the notes to be returned.
 */
export function getNotes(course: string, shape: DataShape) {
  return remote.find({
    selector: {
      course,
      docType: DocType.DISPLAYABLE_DATA,
      id_datashape: shape.name
    }
  });
}

/**
 * Returns *all* cards from the paramater courses, in
 * 'qualified' card format ("courseid-cardid")
 *
 * @param courseIDs A list of all course_ids to get cards from
 */
export async function getRandomCards(courseIDs: string[]) {

  if (courseIDs.length === 0) {
    throw new Error(`getRandomCards:\n\tAttempted to get all cards from no courses!`);
  } else {


    const courseResults = await Promise.all(courseIDs.map((course) => {
      return getCourseDB(course).find({
        selector: {
          docType: DocType.CARD
        },
        limit: 1000
      });
    })
    );

    const ret: string[] = [];
    courseResults.forEach((courseCards, index) => {
      courseCards.docs.forEach((doc) => {
        ret.push(`${courseIDs[index]}-${doc._id}`);
      });
    });

    return ret;
  }
}

/**
 * Returns all course cards sorted by elo-proximity to the input elo
 * in 'qualified' card format ("courseid-cardid-elo")
 * 
 * @param course_id id of the Course being queried
 * @param elo the target elo card rating
 */
export async function getEloNeighborCards(course_id: string, elo: number) {
  const cards = await getCourseDB(course_id).query('elo');
  const rows = _.shuffle(cards.rows);

  return rows.sort((a, b) => {
    return Math.abs(a.key - elo) - Math.abs(b.key - elo);
  }).map(card => `${course_id}-${card.id}-${card.key}`);
}

export async function putCardRecord<T extends CardRecord>(record: T, user: string) {
  const userDB = getUserDB(user);
  const cardHistoryID = getCardHistoryID(record.courseID, record.cardID);

  try {
    const cardHistory = await userDB.get<CardHistory<T>>(cardHistoryID);
    cardHistory.records.push(record);
    userDB.put(cardHistory);
    momentifyCardHistory<T>(cardHistory);
    return cardHistory;
  } catch (reason) {
    if (reason.status === 404) {
      const initCardHistory: CardHistory<T> = {
        _id: cardHistoryID,
        cardID: record.cardID,
        courseID: record.courseID,
        records: [record]
      };
      momentifyCardHistory<T>(initCardHistory);
      userDB.put<CardHistory<T>>(initCardHistory);
      return initCardHistory;
    } else {
      throw new Error(`putCardRecord failed because of:
name:${reason.name}
error: ${reason.error}
id: ${reason.id}
message: ${reason.message}`);
    }
  }
}

function momentifyCardHistory<T extends CardRecord>(cardHistory: CardHistory<T>) {
  cardHistory.records = cardHistory.records.map<T>((record) => {
    const ret: T = {
      ...(record as object)
    } as T;
    ret.timeStamp = moment.utc(record.timeStamp);
    return ret;
  });
}

const REVIEW_PREFIX: string = 'card_review_';
const REVIEW_TIME_FORMAT: string = 'YYYY-MM-DD--kk:mm:ss-SSS';

export function scheduleCardReview(review: {
  user: string,
  course_id: string,
  card_id: PouchDB.Core.DocumentId,
  time: Moment,
  scheduledFor: ScheduledCard['scheduledFor'],
  schedulingAgentId: ScheduledCard['schedulingAgentId']
}) {
  const now = moment.utc();
  console.log(`Scheduling for review in: ${review.time.diff(now, 'h') / 24} days`);
  getUserDB(review.user).put<ScheduledCard>({
    _id: REVIEW_PREFIX + review.time.format(REVIEW_TIME_FORMAT),
    cardId: review.card_id,
    reviewTime: review.time,
    courseId: review.course_id,
    scheduledAt: now,
    scheduledFor: review.scheduledFor,
    schedulingAgentId: review.schedulingAgentId
  });
}

/**
 * Returns a promise of all cardReview IDs which are due for review.
 *
 * @param user The username whose scheduled cards are of interest
 */
export async function getScheduledCards(user: string, limit?: number) {
  const cLimit = limit || 999;
  const keys = getStartAndEndKeys(REVIEW_PREFIX);
  const now = moment.utc();
  const userDB = getUserDB(user);
  const allDocs = await userDB.allDocs({
    startkey: keys.startkey,
    endkey: keys.endkey
  });
  const ret: PouchDB.Core.DocumentId[] = [];

  // todo: future optimization here: saves multiple trips to the db
  //       for relevant doc IDs -> docs. Needs a little time to test...
  // const allDocs = await userDB.allDocs<ScheduledCard>({
  //   startkey: REVIEW_PREFIX,
  //   endkey: REVIEW_PREFIX + moment.utc().format(REVIEW_TIME_FORMAT)
  // });

  allDocs.rows.forEach((row) => {
    if (row.id.startsWith(REVIEW_PREFIX)) {
      const date = moment.utc(
        row.id.substr(REVIEW_PREFIX.length),
        REVIEW_TIME_FORMAT
      );
      if (now.isAfter(date) && ret.length < cLimit) {
        ret.push(row.id);
      }
    }
  });
  const reviewDocs = await userDB.allDocs<ScheduledCard>({
    include_docs: true,
    keys: ret
  });

  return reviewDocs.rows.map(r => r.doc!);

  // todo: remove this! this deletion should occur
  //       AFTER the card is successfully dealt with
  //       in the session
  // reviewDocs.rows.forEach((row) => {
  //   userDB.remove(row.doc!);
  // });

  // return reviewDocs.rows.map((row) => {
  //   return `${row.doc!.courseId}-${row.doc!.cardId}`;
  // });
}

export async function removeScheduledCardReview(user: string, reviewDocID: string) {
  const db = getUserDB(user);
  let reviewDoc = await db.get(reviewDocID);
  db.remove(reviewDoc);
}

export function filterAlldocsByPrefix<T>(db: PouchDB.Database, prefix: string, opts?: PouchDB.Core.AllDocsOptions) {
  // see couchdb docs 6.2.2:
  //   Guide to Views -> Views Collation -> String Ranges
  let options: PouchDB.Core.AllDocsWithinRangeOptions = {
    startkey: prefix,
    endkey: prefix + '\ufff0',
    include_docs: true
  };

  if (opts) {
    Object.assign(options, opts);
  }
  return db.allDocs<T>(options);
}

export function getStartAndEndKeys(key: string) {
  return {
    startkey: key,
    endkey: key + '\ufff0'
  };
}

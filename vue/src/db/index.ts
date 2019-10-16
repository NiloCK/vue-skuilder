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
import { GuestUsername } from '@/store';
import moment, { Moment } from 'moment';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import process from 'process';
import { log } from 'util';
import { ScheduledCard } from './User';
import { getUserDB } from './userDB';

(window as any).process = process; // required as a fix for pouchdb - see #18

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

if (ENV.DEBUG) {
  // pouch.debug.enable('pouchdb:find');
}

const expiryDocID: string = 'GuestAccountExpirationDate';
const dbUUID = 'dbUUID';

export const remote: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + 'skuilder',
  {
    skip_setup: true
  }
);
export const localUserDB: PouchDB.Database = new pouch('skuilder');

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


export function accomodateGuest() {
  let username: string;

  if (localStorage.getItem(dbUUID) !== null) {
    username = GuestUsername + localStorage.getItem(dbUUID);
    remoteDBLogin(username, localStorage.getItem(dbUUID)!);
  } else {
    const uuid = generateUUID();
    localStorage.setItem(dbUUID, uuid);
    username = GuestUsername + uuid;
    remoteDBSignup(username, uuid);
    remoteDBLogin(username, uuid);
  }

  return username;

  // pilfered from https://stackoverflow.com/a/8809472/1252649
  function generateUUID() {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}

export function remoteDBLogin(username: string, password: string) {
  return remote.logIn(username, password);
}

export function remoteDBLogout() {
  return remote.logOut();
}

export function remoteDBSignup(
  username: string,
  password: string,
  options?: PouchDB.Authentication.PutUserOptions) {

  const newDBRequest = remote.signUp(username, password);

  newDBRequest.then((resp) => {
    if (resp.ok) {
      localUserDB.get(expiryDocID).then((doc) => {
        return localUserDB.remove(doc._id, doc._rev);
      }).then(() => {
        localUserDB.replicate.to(getUserDB(username));
      }).catch(() => {
        localUserDB.replicate.to(getUserDB(username));
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

function createCards(course: string, dataShapeId: PouchDB.Core.DocumentId, noteId: PouchDB.Core.DocumentId) {
  getImplementingQuestions(dataShapeId)
    .then((qPromises) => {
      qPromises.forEach((questionPromise) => {
        questionPromise.then((question) => {
          const qName = NameSpacer.getQuestionDescriptor(
            question._id
          ).questionType;

          question.viewList.forEach((view) => {
            addCard(
              course,
              [noteId],
              NameSpacer.getViewString({
                course,
                questionType: qName,
                view
              })
            );
          });
        });
      });
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
 * Returns a list of the registered dataShapes for the specified course,
 * or a list of all registered dataShapes if no course name is provided
 * @param course The name of the course to search
 */
export function getDataShapes(course?: string) {
  if (course) {
    return remote.find({
      selector: {
        course,
        docType: DocType.DATASHAPE
      }
    });
  } else {
    return remote.find({
      selector: {
        docType: DocType.DATASHAPE
      }
    });
  }
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
 * Adds a card to the DB. This function is called
 * as a side effect of adding either a View or
 * DisplayableData item.
 * @param course The name of the course that the card belongs to
 * @param id_displayable_data C/PouchDB ID of the data used to hydrate the view
 * @param id_view C/PouchDB ID of the view used to display the card
 */
function addCard(
  course: string,
  id_displayable_data: PouchDB.Core.DocumentId[],
  id_view: PouchDB.Core.DocumentId) {
  return remote.post<CardData>({
    course,
    id_displayable_data,
    id_view,
    docType: DocType.CARD
  });
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

export function scheduleCardReview(user: string, course_id: string, card_id: PouchDB.Core.DocumentId, time: Moment) {
  // createClassroom("testClass"); // testing this function...

  const now = moment.utc();
  getUserDB(user).put<ScheduledCard>({
    _id: REVIEW_PREFIX + time.format(REVIEW_TIME_FORMAT),
    cardId: card_id,
    reviewTime: time,
    courseId: course_id,
    scheduledAt: now
  });
}

/**
 * Returns a promise of all cardReview IDs which are due for review.
 *
 * @param user The username whose scheduled cards are of interest
 */
export async function getScheduledCards(user: string) {
  const now = moment.utc();
  const userDB = getUserDB(user);
  const allDocs = await userDB.allDocs({});
  const ret: PouchDB.Core.DocumentId[] = [];
  allDocs.rows.forEach((row) => {
    if (row.id.startsWith(REVIEW_PREFIX)) {
      const date = moment.utc(
        row.id.substr(REVIEW_PREFIX.length),
        REVIEW_TIME_FORMAT
      );
      if (now.isAfter(date)) {
        ret.push(row.id);
      }
    }
  });
  const reviewDocs = await userDB.allDocs<ScheduledCard>({
    include_docs: true,
    keys: ret
  });

  // todo: remove this! this deletion should occur
  //       AFTER the card is successfully dealt with
  //       in the session
  reviewDocs.rows.forEach((row) => {
    userDB.remove(row.doc!);
  });

  return reviewDocs.rows.map((row) => {
    return `${row.doc!.courseId}-${row.doc!.cardId}`;
  });
}

export async function removeScheduledCardReview(user: string, doc: ScheduledCard & PouchDB.Core.GetMeta) {
  getUserDB(user).remove(doc);
}

/**
 * Returns a promise of the card IDs that the user has
 * previously studied
 *
 * @param user The username of the corcerned user
 */
export async function getActiveCards(user: string) {
  const now = moment.utc();
  const docs = await getUserDB(user).allDocs({});
  const ret: PouchDB.Core.DocumentId[] = [];
  docs.rows.forEach((row) => {
    if (row.id.startsWith('cardH-')) {
      ret.push(row.id.substr('cardH-'.length));
    }
  });
  return ret;
}

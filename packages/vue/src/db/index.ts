import {
  CardHistory,
  CardRecord,
  DocType,
  getCardHistoryID,
  SkuilderCourseData,
} from '../db/types';
import ENV from '../ENVIRONMENT_VARS';
import { GuestUsername } from '../store';
import moment, { Moment } from 'moment';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import process from 'process';
import { log } from 'util';
import { getUserDB, ScheduledCard, User } from './userDB';

(window as any).process = process; // required as a fix for pouchdb - see #18

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

if (ENV.DEBUG) {
  // pouch.debug.enable('pouchdb:find');
}

const expiryDocID: string = 'GuestAccountExpirationDate';
const dbUUID = 'dbUUID';

const remoteStr: string = ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + 'skuilder';

log(`Remote db: ${remoteStr}`);

const GUEST_LOCAL_DB = `userdb-${GuestUsername}`;
export const localUserDB: PouchDB.Database = new pouch(GUEST_LOCAL_DB);

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
  },
} as PouchDB.Configuration.RemoteDatabaseConfiguration;

function getCouchDB(dbName: string): PouchDB.Database {
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + dbName,
    pouchDBincludeCredentialsConfig
  );
}

export function getCourseDB(courseID: string): PouchDB.Database {
  // todo: keep a cache of opened courseDBs? need to benchmark this somehow
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + 'coursedb-' + courseID,
    pouchDBincludeCredentialsConfig
  );
}

export async function getLatestVersion() {
  try {
    const docs = await getCouchDB('version').allDocs({
      descending: true,
      limit: 1,
    });
    if (docs && docs.rows && docs.rows[0]) {
      return docs.rows[0].id;
    } else {
      return '0.0.0';
    }
  } catch {
    return '-1';
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

  guestDB
    .get(expiryDocID)
    .then((doc) => {
      guestDB.put({
        _id: expiryDocID,
        _rev: doc._rev,
        date: expirationDate,
      });
    })
    .catch((err: PouchDB.Core.Error) => {
      guestDB.put({
        _id: expiryDocID,
        date: expirationDate,
      });
    });
}

export function getCourseDocs<T extends SkuilderCourseData>(
  courseID: string,
  docIDs: string[],
  options: PouchDB.Core.AllDocsOptions = {}
) {
  return getCourseDB(courseID).allDocs<T>({
    ...options,
    keys: docIDs,
  });
}

export function getCourseDoc<T extends SkuilderCourseData>(
  courseID: string,
  docID: PouchDB.Core.DocumentId,
  options: PouchDB.Core.GetOptions = {}
): Promise<T> {
  return getCourseDB(courseID).get<T>(docID, options);
}

/**
 * Returns *all* cards from the parameter courses, in
 * 'qualified' card format ("courseid-cardid")
 *
 * @param courseIDs A list of all course_ids to get cards from
 */
export async function getRandomCards(courseIDs: string[]) {
  if (courseIDs.length === 0) {
    throw new Error(`getRandomCards:\n\tAttempted to get all cards from no courses!`);
  } else {
    const courseResults = await Promise.all(
      courseIDs.map((course) => {
        return getCourseDB(course).find({
          selector: {
            docType: DocType.CARD,
          },
          limit: 1000,
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
 * Logs a record of the user's interaction with the card and returns the card's
 * up-to-date history
 * @param record the recent recorded interaction between user and card
 * @param user the current user
 * @returns The updated state of the card's CardHistory data
 */
export async function putCardRecord<T extends CardRecord>(
  record: T,
  user: string
): Promise<CardHistory<CardRecord>> {
  const cardHistoryID = getCardHistoryID(record.courseID, record.cardID);
  // stringify the current record to make it writable to couchdb
  record.timeStamp = moment.utc(record.timeStamp).toString() as any;

  try {
    const u = await User.instance();

    const cardHistory = await u.update<CardHistory<T>>(cardHistoryID, function (h: CardHistory<T>) {
      h.records.push(record);
      h.bestInterval = h.bestInterval || 0;
      h.lapses = h.lapses || 0;
      h.streak = h.streak || 0;
      return h;
    });

    momentifyCardHistory<T>(cardHistory);
    return cardHistory;
  } catch (reason) {
    if (reason.status === 404) {
      const initCardHistory: CardHistory<T> = {
        _id: cardHistoryID,
        cardID: record.cardID,
        courseID: record.courseID,
        records: [record],
        lapses: 0,
        streak: 0,
        bestInterval: 0,
      };
      getUserDB(user).put<CardHistory<T>>(initCardHistory);
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

function deMomentifyCardHistory<T extends CardRecord>(cardHistory: CardHistory<T>) {
  cardHistory.records = cardHistory.records.map((r) => {
    return {
      ...r,
      timeStamp: r.timeStamp.toString(),
    };
  });
}
function momentifyCardHistory<T extends CardRecord>(cardHistory: CardHistory<T>) {
  cardHistory.records = cardHistory.records.map<T>((record) => {
    const ret: T = {
      ...(record as object),
    } as T;
    ret.timeStamp = moment.utc(record.timeStamp);
    return ret;
  });
}

export const REVIEW_PREFIX: string = 'card_review_';
export const REVIEW_TIME_FORMAT: string = 'YYYY-MM-DD--kk:mm:ss-SSS';

export function scheduleCardReview(review: {
  user: string;
  course_id: string;
  card_id: PouchDB.Core.DocumentId;
  time: Moment;
  scheduledFor: ScheduledCard['scheduledFor'];
  schedulingAgentId: ScheduledCard['schedulingAgentId'];
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
    schedulingAgentId: review.schedulingAgentId,
  });
}

export async function removeScheduledCardReview(user: string, reviewDocID: string) {
  const db = getUserDB(user);
  let reviewDoc = await db.get(reviewDocID);
  db.remove(reviewDoc)
    .then((res) => {
      if (res.ok) {
        log(`Removed Review Doc: ${reviewDocID}`);
      }
    })
    .catch((err) => {
      log(`Failed to remove Review Doc: ${reviewDocID},\n${JSON.stringify(err)}`);
    });
}

export function filterAllDocsByPrefix<T>(
  db: PouchDB.Database,
  prefix: string,
  opts?: PouchDB.Core.AllDocsOptions
) {
  // see couchdb docs 6.2.2:
  //   Guide to Views -> Views Collation -> String Ranges
  let options: PouchDB.Core.AllDocsWithinRangeOptions = {
    startkey: prefix,
    endkey: prefix + '\ufff0',
    include_docs: true,
  };

  if (opts) {
    Object.assign(options, opts);
  }
  return db.allDocs<T>(options);
}

export function getStartAndEndKeys(key: string) {
  return {
    startkey: key,
    endkey: key + '\ufff0',
  };
}

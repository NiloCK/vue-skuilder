import ENV from '@/ENVIRONMENT_VARS';
import { GuestUsername } from '@/store';
import pouch from 'pouchdb-browser';
import { log } from 'util';
import {
  hexEncode,
  pouchDBincludeCredentialsConfig,
  updateGuestAccountExpirationDate,
  filterAlldocsByPrefix,
  getStartAndEndKeys,
  REVIEW_PREFIX,
  REVIEW_TIME_FORMAT
} from './index';
import { getCourseConfigs } from './courseDB';
import { Status } from '@/enums/Status';
import moment from 'moment';
import { ScheduledCard } from './User';

const remoteStr: string = ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + 'skuilder';
const remoteCouchRootDB: PouchDB.Database = new pouch(
  remoteStr,
  {
    skip_setup: true
  }
);

/**
 * The current logged-in user
 */
export class User {
  private static _instance: User;
  private static _initialized: boolean = false;

  private email: string;
  private _username: string;
  public get username(): string { return this._username; }

  private remoteDB: PouchDB.Database;
  private localDB: PouchDB.Database;

  public async createAccount(username: string, password: string) {
    let ret = {
      status: Status.ok,
      error: ''
    }

    if (!this._username.startsWith(GuestUsername)) {
      throw new Error(
        `Cannot create a new account while logged in:
Currently logged-in as ${this._username}.`);
    } else {

      try {


        const oldUsername = this._username;

        const signupRequest = await remoteCouchRootDB.signUp(username, password);

        if (signupRequest.ok) {
          log(`CREATEACCOUNT: logging out of ${this.username}`);
          const logoutResult = await remoteCouchRootDB.logOut();
          log(`CREATEACCOUNT: logged out: ${logoutResult.ok}`);
          const loginResult = await remoteCouchRootDB.logIn(username, password);
          log(`CREATEACCOUNT: logged in as new user: ${loginResult.ok}`);
          const newLocal = getLocalUserDB(username);
          const newRemote = getUserDB(username);

          this.localDB.replicate.to(
            newLocal
          ).on('complete', () => {
            newLocal.replicate.to(
              newRemote
            ).on('complete', async () => {
              log('CREATEACCOUNT: Attempting to destroy guest localDB')
              await clearLocalGuestDB();

              // reset this.local & this.remote DBs
              this._username = username;
              this.init();
            });
          });

        } else {
          ret.status = Status.error;
          ret.error = ''
          console.log(`Signup not OK: ${JSON.stringify(signupRequest)}`);
          // throw signupRequest;
          return ret;
        }
      } catch (e) {
        if (e.reason === "Document update conflict.") {
          ret.error = "This username is taken!";
          ret.status = Status.error;
        }
        console.log(`Error on signup: ${JSON.stringify(e)}`);
        return ret;
      }
    }

    return ret;
  }
  public async login(username: string, password: string) {
    if (!this._username.startsWith(GuestUsername)) {
      throw new Error(`Cannot change accounts while logged in.
      Log out of account ${this.username} before logging in as ${username}.`);
    }

    let loginResult = await remoteCouchRootDB.logIn(username, password);
    if (loginResult.ok) {
      log(`Logged in as ${username}`);
      this._username = username;
      localStorage.removeItem('dbUUID');
      await this.init();
    } else {
      log(`Login ERROR as ${username}`);
    }
    return loginResult;
  }
  public async logout() {
    // end session w/ couchdb
    const ret = await this.remoteDB.logOut();
    // return to 'guest' mode
    this._username = GuestUsername;
    await this.init();

    return ret;
  }

  public async getCourseRegistrationsDoc():
    Promise<CourseRegistrationDoc & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta> {
    console.log(`Fetching courseRegistrations for ${this.username}`);

    let ret;

    try {
      ret = await this.localDB.get<CourseRegistrationDoc>(userCoursesDoc);
    } catch (e) {

      if (e.status === 404) {
        // doc does not exist. Create it and then run this fcn again.
        await this.localDB.put<CourseRegistrationDoc>({
          _id: userCoursesDoc,
          courses: [],
          studyWeight: {}
        });
        ret = await this.getCourseRegistrationsDoc();
      } else {
        throw new Error(`Unexpected error ${JSON.stringify(e)} in getOrCreateCourseRegistrationDoc...`);
      }

    }

    return ret;
  }

  public async getActiveCourses() {
    const reg = await this.getCourseRegistrationsDoc();
    return reg.courses.filter((c) => {
      return c.status === undefined || c.status === 'active'
    });
  }

  public async getPendingReviews(course_id: string) {
    const keys = getStartAndEndKeys(REVIEW_PREFIX);
    const now = moment.utc();
    log(`Fetching scheduled reviews for course: ${course_id}`);

    const reviews = await this.remoteDB.allDocs<ScheduledCard>({
      startkey: keys.startkey,
      endkey: keys.endkey,
      include_docs: true
    });

    return reviews.rows.filter((r) => {
      if (r.id.startsWith(REVIEW_PREFIX)) {
        const date = moment.utc(
          r.id.substr(REVIEW_PREFIX.length),
          REVIEW_TIME_FORMAT
        );
        if (now.isAfter(date) && r.doc!.courseId === course_id) {
          return true;
        }
      }
    }).map(r => r.doc!);
  }

  public async getScheduledReviewCount(course_id: string): Promise<number> {
    return (await this.getPendingReviews(course_id)).length;
  }

  public async getRegisteredCourses() {
    const regDoc = await this.getCourseRegistrationsDoc();
    return regDoc.courses.filter((c) => {
      return !c.status || c.status === 'active' || c.status === 'maintenance-mode'
    });
  }

  public async getCourseRegDoc(courseID: string) {
    const regDocs = (await this.getCourseRegistrationsDoc());
    return regDocs.courses.find(c => c.courseID === courseID);
  }

  public async registerForCourse(course_id: string, previewMode: boolean = false) {
    return this.getCourseRegistrationsDoc().then((doc: CourseRegistrationDoc) => {
      const status = previewMode ? 'preview' : 'active';
      console.log(`Registering for ${course_id} with status: ${status}`);

      const regItem: CourseRegistration = {
        status: status,
        courseID: course_id,
        user: true,
        admin: false,
        moderator: false,
        elo: 1000,
        taggedElo: {}
      };

      if (doc.courses.filter((course) => {
        return course.courseID === regItem.courseID;
      }).length === 0) {
        log(`It's a new course registration!`);
        doc.courses.push(regItem);
        doc.studyWeight[course_id] = 1;
      } else {
        doc.courses.forEach((c) => {
          log(`Found the previously registered course!`);
          if (c.courseID === course_id) {
            c.status = status;
          }
        });
      }

      return this.localDB.put<CourseRegistrationDoc>(doc);
    }).catch((e) => {
      log(`Registration failed because of: ${JSON.stringify(e)}`);
      throw e;
    });
  }
  public async dropCourse(course_id: string, dropStatus: CourseRegistration['status'] = 'dropped') {
    return this.getCourseRegistrationsDoc().then((doc) => {
      let index: number = -1;
      for (let i = 0; i < doc.courses.length; i++) {
        if (doc.courses[i].courseID === course_id) {
          index = i;
        }
      }

      if (index !== -1) {
        // remove from the relative-weighting of course study
        delete doc.studyWeight[course_id];
        // set drop status
        doc.courses[index].status = dropStatus;
      } else {
        throw new Error(`User ${this.username} is not currently registered for course ${course_id}`);
      }

      return this.localDB.put<CourseRegistrationDoc>(doc);
    });
  }

  public async getUserEditableCourses() {
    let courseIDs: string[] = [];

    const registeredCourses = await this.getCourseRegistrationsDoc();

    courseIDs = courseIDs.concat(registeredCourses.courses.map((course) => {
      return course.courseID;
    }));

    return getCourseConfigs(courseIDs);
  }

  /**
   * Returns the current user.
   * 
   * @param username Only supplied on page-load by store.ts - from the cookie authSession response
   */
  public static async instance(username?: string): Promise<User> {
    if (username) {
      User._instance = new User(username);
      await User._instance.init();
      return User._instance;
    } else if (User._instance && User._initialized) {
      log(`USER.instance() returning user ${User._instance._username}`);
      return User._instance;
    } else if (User._instance) {
      return new Promise((resolve, reject) => {
        (function waitForUser() {
          if (User._initialized) {
            return resolve(User._instance);
          } else {
            setTimeout(waitForUser, 50);
          }
        })();
      });
    } else {
      User._instance = new User(GuestUsername);
      await User._instance.init();
      return User._instance;
    }
  }

  private constructor(username: string) {
    User._initialized = false;
    this._username = username;
  }

  private async init() {
    User._initialized = false;
    if (this._username === GuestUsername) {
      const acc = accomodateGuest();
      this._username = acc.username;
      if (acc.firstVisit) {
        await this.createAccount(this._username, this._username);
      }
      await this.login(this._username, this._username);
    }
    this.localDB = getLocalUserDB(this._username);
    this.remoteDB = getUserDB(this._username);

    pouch.sync(this.localDB, this.remoteDB, {
      live: true,
      retry: true
    });
    this.applyDesignDocs();
    this.deduplicateReviews();
    User._initialized = true;
  }

  private static designDocs = [
    {
      _id: '_design/reviewCards',
      views: {
        'reviewCards': {
          map: (function (doc: PouchDB.Core.Document<{}>) {
            if (doc._id.indexOf('card_review') === 0) {
              emit(doc._id, doc.courseId + '-' + doc.cardId);
            }
          }).toString()
        }
      }
    }
  ]

  private async applyDesignDocs() {
    User.designDocs.forEach((doc) => {
      this.remoteDB.get(doc._id).catch((e) => {
        if (e.name === "not_found") {
          this.remoteDB.put(doc);
        }
      }).then((oldDoc) => {
        this.remoteDB.put({
          ...doc,
          _rev: (oldDoc as any)._rev
        });
      });
    })
  }

  private async deduplicateReviews() {
    const reviewsMap: { [index: string]: string[] } = {};
    const scheduledReviews = await this.remoteDB.query<{
      id: String;
      value: string
    }>('reviewCards');

    scheduledReviews.rows.forEach((r) => {
      if (reviewsMap[r.value]) {
        // this card is scheduled more than once! delete this scheduled review
        log(`Removing duplicate scheduled review for card: ${r.value}`);
        this.remoteDB.get((r.key)).then((doc) => {
          this.remoteDB.remove(doc);
        });
      } else {
        // note that this card is scheduled for review
        reviewsMap[r.value] = r.key;
      }
    });
  }


  /**
   * Returns a promise of the card IDs that the user has
   * previously studied
   * 
   * @param course_id optional specification of individual course
   */
  async getActiveCards(course_id?: string) {
    let prefix = 'cardH-';
    if (course_id) {
      prefix += course_id
    }
    const docs = await filterAlldocsByPrefix(this.localDB, prefix, {
      include_docs: false
    });
    // const docs = await this.localDB.allDocs({});
    const ret: PouchDB.Core.DocumentId[] = [];
    docs.rows.forEach((row) => {

      if (row.id.startsWith('cardH-')) {
        ret.push(row.id.substr('cardH-'.length));
      }
    });
    return ret;
  }

  async updateCourseSettings(course_id: string, settings: {
    key: string;
    value: string | number | boolean;
  }[]) {
    this.getCourseRegistrationsDoc().then((doc) => {
      let crs = doc.courses.find(c => c.courseID === course_id);
      if (crs) {
        if (crs.settings === null || crs.settings === undefined) {
          crs.settings = {};
        }
        settings.forEach(setting => {
          crs!.settings![setting.key] = setting.value;
        });
      }

      return this.localDB.put(doc);
    });
  }
  async getCourseSettings(course_id: string) {
    const regDoc = await this.getCourseRegistrationsDoc();
    const crsDoc = regDoc.courses.find(c => c.courseID === course_id);

    if (crsDoc) {
      return crsDoc.settings;
    } else {
      throw new Error(`getCourseSettings Failed:
      User is not registered for course ${course_id}`)
    }
  }
}

export function getLocalUserDB(username: string): PouchDB.Database {
  return new pouch(`userdb-${username}`);
}

async function clearLocalGuestDB() {
  const docs = await getLocalUserDB(GuestUsername).allDocs({
    limit: 1000,
    include_docs: true
  });

  docs.rows.forEach(r => {
    log(`CREATEACCOUNT: Deleting ${r.id}`);
    getLocalUserDB(GuestUsername).remove(r.doc!);
  });
  delete localStorage.dbUUID;
}

export function getUserDB(username: string): PouchDB.Database {
  let guestAccount: boolean = false;
  console.log(`Getting user db: ${username}`);

  const hexName = hexEncode(username);
  const dbName = `userdb-${hexName}`;
  log(`Fetching user database: ${dbName} (${username})`);

  // odd construction here the result of a bug in the
  // interaction between pouch, pouch-auth.
  // see: https://github.com/pouchdb-community/pouchdb-authentication/issues/239
  const ret = new pouch(ENV.COUCHDB_SERVER_PROTOCOL +
    '://' +
    ENV.COUCHDB_SERVER_URL + dbName, pouchDBincludeCredentialsConfig);
  if (guestAccount) {
    updateGuestAccountExpirationDate(ret);
  }

  return ret;
}

function accomodateGuest(): {
  username: string;
  firstVisit: boolean;
} {
  const dbUUID = 'dbUUID';
  let firstVisit: boolean;

  if (localStorage.getItem(dbUUID) !== null) {
    firstVisit = false;
    console.log(`Returning guest ${localStorage.getItem(dbUUID)} "logging in".`);
  } else {
    firstVisit = true;
    const uuid = generateUUID();
    localStorage.setItem(dbUUID, uuid);
    console.log(`Accommodating a new guest with account: ${uuid}`);
  }

  return {
    username: GuestUsername + localStorage.getItem(dbUUID),
    firstVisit: firstVisit
  };

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

const userCoursesDoc = 'CourseRegistrations';
const userClassroomsDoc = 'ClassroomRegistrations';

interface TaggedElo {
  [tag: string]: number;
}

export interface CourseRegistration {
  status?: 'active' | 'dropped' | 'maintenance-mode' | 'preview';
  courseID: string;
  admin: boolean;
  moderator: boolean;
  user: boolean;
  settings?: {
    [setting: string]: string | number | boolean
  }
  elo: number;
  taggedElo: TaggedElo;
}

interface StudyWeights {
  [courseID: string]: number;
}

export interface CourseRegistrationDoc {
  courses: CourseRegistration[];
  studyWeight: StudyWeights;
}

export type ClassroomRegistrationDesignation =
  'student' | 'teacher' | 'aide' | 'admin';

interface ClassroomRegistration {
  classID: string;
  registeredAs: ClassroomRegistrationDesignation;
}

interface ClassroomRegistrationDoc {
  registrations: ClassroomRegistration[];
}

async function getOrCreateClassroomRegistrationsDoc(user: string):
  Promise<ClassroomRegistrationDoc & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta> {
  let ret;

  try {
    ret = await getUserDB(user).get<ClassroomRegistrationDoc>(userClassroomsDoc);
  } catch (e) {

    if (e.status === 404) {
      // doc does not exist. Create it and then run this fcn again.
      await getUserDB(user).put<ClassroomRegistrationDoc>({
        _id: userClassroomsDoc,
        registrations: []
      });
      ret = await getOrCreateClassroomRegistrationsDoc(user);
    } else {
      throw new Error(`Unexpected error ${JSON.stringify(e)} in getOrCreateClassroomRegistrationDoc...`);
    }

  }

  return ret;
}

async function getOrCreateCourseRegistrationsDoc(user: string):
  Promise<CourseRegistrationDoc & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta> {
  let ret;

  try {
    ret = await getUserDB(user).get<CourseRegistrationDoc>(userCoursesDoc);
  } catch (e) {

    if (e.status === 404) {
      // doc does not exist. Create it and then run this fcn again.
      await getUserDB(user).put<CourseRegistrationDoc>({
        _id: userCoursesDoc,
        courses: [],
        studyWeight: {}
      });
      ret = await getOrCreateCourseRegistrationsDoc(user);
    } else {
      throw new Error(`Unexpected error ${JSON.stringify(e)} in getOrCreateCourseRegistrationDoc...`);
    }

  }

  return ret;
}

export async function updateUserElo(user: string, course_id: string, elo: number | TaggedElo) {
  let regDoc = await getOrCreateCourseRegistrationsDoc(user);
  if (isTaggedElo(elo)) {
    for (const tag in elo) {
      regDoc.courses.find(c => c.courseID === course_id)!
        .taggedElo[tag] = elo[tag]
    }
  } else {
    regDoc.courses.find(c => c.courseID === course_id)!
      .elo = elo;
  }
  return getUserDB(user).put(regDoc);
}

function isTaggedElo(e: number | TaggedElo): e is TaggedElo {
  return (e as TaggedElo).length !== undefined;
}

export async function registerUserForClassroom(user: string, classID: string, registerAs: ClassroomRegistrationDesignation) {
  log(`Registering user: ${user} in course: ${classID}`);
  return getOrCreateClassroomRegistrationsDoc(user).then((doc) => {
    const regItem = {
      classID: classID,
      registeredAs: registerAs
    };

    if (doc.registrations.filter((reg) => {
      return reg.classID === regItem.classID && reg.registeredAs === regItem.registeredAs
    }).length === 0) {
      doc.registrations.push(regItem);
    } else {
      log(`User ${user} is already registered for class ${classID}`);
    }

    return getUserDB(user).put(doc);
  });
}

export async function dropUserFromClassroom(user: string, classID: string) {
  return getOrCreateClassroomRegistrationsDoc(user).then((doc) => {
    let index: number = -1;

    for (let i = 0; i < doc.registrations.length; i++) {
      if (doc.registrations[i].classID === classID) {
        index = i;
      }
    }

    if (index !== -1) {
      doc.registrations.splice(index, 1);
    }
    return getUserDB(user).put(doc);
  });
}

export async function getUserClassrooms(user: string) {
  return getOrCreateClassroomRegistrationsDoc(user);
}

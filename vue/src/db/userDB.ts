import ENV from '@/ENVIRONMENT_VARS';
import { GuestUsername } from '@/store';
import pouch from 'pouchdb-browser';
import { log } from 'util';
import {
  accomodateGuest,
  hexEncode,
  pouchDBincludeCredentialsConfig,
  updateGuestAccountExpirationDate,
  localUserDB,
  remoteDBSignup,
  remoteDBLogin
} from './index';
import { getCourseConfigs } from './courseDB';
import { Moment } from 'moment';
import { Status } from '@/enums/Status';

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
          await remoteCouchRootDB.logOut();
          await remoteDBLogin(username, password);

          const newLocal = getLocalUserDB(username);
          const newRemote = getUserDB(username);

          const sync = await Promise.all(
            [
              this.localDB.replicate.to(newLocal),
              this.localDB.replicate.to(newRemote)
            ]
          );
          // remove existing 'guest' database so that future
          // guests on the device start fresh
          this.localDB.destroy();

          // reset this.local & this.remote DBs
          this._username = username;
          // reset this.local & this.remote DBs
          this.init();
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
      this._username = username;
      await this.init();
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

  public async getRegisteredCourses() {
    const regDoc = await this.getCourseRegistrationsDoc();
    return regDoc.courses.filter((c) => {
      return !c.status || c.status === 'active' || c.status === 'maintenance-mode'
    });
  }

  public async registerForCourse(course_id: string, previewMode: boolean = false) {
    return this.getCourseRegistrationsDoc().then((doc: CourseRegistrationDoc) => {
      const regItem: CourseRegistration = {
        status: previewMode ? 'preview' : 'active',
        courseID: course_id,
        user: true,
        admin: false,
        moderator: false,
        elo: 1000,
        taggedElo: {}
      };
      log(`Registering for course: ${course_id}`);

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
            c.status = 'active';
          }
        });
      }

      return this.localDB.put<CourseRegistrationDoc>(doc);
    }).catch((e) => {
      log(`Registration failed because of: ${JSON.stringify(e)}`);
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
    this.localDB = getLocalUserDB(this._username);
    this.remoteDB = getUserDB(this._username);

    pouch.sync(this.localDB, this.remoteDB, {
      live: true,
      retry: true
    });
    User._initialized = true;
  }

  public courseRegistrations: string[];

  /**
  * Returns a promise of the card IDs that the user has
  * previously studied
  */
  async getActiveCards() {
    const docs = await this.localDB.allDocs({});
    const ret: PouchDB.Core.DocumentId[] = [];
    docs.rows.forEach((row) => {
      if (row.id.startsWith('cardH-')) {
        ret.push(row.id.substr('cardH-'.length));
      }
    });
    return ret;
  }
}

export function getLocalUserDB(username: string): PouchDB.Database {
  return new pouch(`userdb-${username}`);
}

export function getUserDB(username: string): PouchDB.Database {
  let guestAccount: boolean = false;
  console.log(`Getting user db: ${username}`);

  if (username === GuestUsername ||
    username === '') {
    // username = accomodateGuest();
    // guestAccount = true;
    return getLocalUserDB(GuestUsername);
  }

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

  pouch.replicate(ret, getLocalUserDB(username));
  return ret;
}

const userCoursesDoc = 'CourseRegistrations';
const userClassroomsDoc = 'ClassroomRegistrations';

interface TaggedElo {
  [tag: string]: number;
}

interface CourseRegistration {
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


export async function updateCourseSetting(
  { user, course_id, settings }: {
    user: string; course_id: string; settings: {
      key: string;
      value: string | number | boolean;
    }[];
  }) {
  getOrCreateCourseRegistrationsDoc(user).then((doc) => {
    let crs = doc.courses.find(c => c.courseID === course_id);
    if (crs) {
      if (crs.settings === null || crs.settings === undefined) {
        crs.settings = {};
      }
      settings.forEach(setting => {
        crs!.settings![setting.key] = setting.value;
      });
    }

    return getUserDB(user).put(doc);
  })
}

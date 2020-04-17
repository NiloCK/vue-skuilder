import ENV from '@/ENVIRONMENT_VARS';
import { GuestUsername } from '@/store';
import pouch from 'pouchdb-browser';
import { log } from 'util';
import {
  accomodateGuest,
  hexEncode,
  pouchDBincludeCredentialsConfig,
  updateGuestAccountExpirationDate,
  localUserDB
} from './index';
import { getCourseConfigs } from './courseDB';

export function getLocalUserDB(username: string): PouchDB.Database {
  return new pouch(`userdb-${username}`);
}

export function getUserDB(username: string): PouchDB.Database {
  let guestAccount: boolean = false;

  if (username === GuestUsername ||
    username === '') {
    username = accomodateGuest();
    guestAccount = true;
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

export async function registerUserForCourse(user: string, course_id: string) {
  return getOrCreateCourseRegistrationsDoc(user).then((doc) => {
    const regItem = {
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
      doc.courses.push(regItem);
      doc.studyWeight[course_id] = 1;
    }

    return getUserDB(user).put(doc);
  });
}

export async function dropUserFromCourse(user: string, course_id: string) {
  return getOrCreateCourseRegistrationsDoc(user).then((doc) => {
    let index: number = -1;
    for (let i = 0; i < doc.courses.length; i++) {
      if (doc.courses[i].courseID === course_id) {
        index = i;
      }
    }

    if (index !== -1) {
      // remove from the relative-weighting of course study
      delete doc.studyWeight[course_id];
      doc.courses.splice(index, 1);
    } else {
      throw new Error(`User ${user} is not currently registered for course ${course_id}`);
    }

    return getUserDB(user).put(doc);
  });
}

export async function getUserCourses(user: string) {
  return getOrCreateCourseRegistrationsDoc(user);
}

export async function getUserClassrooms(user: string) {
  return getOrCreateClassroomRegistrationsDoc(user);
}

export async function getUserEditableCourses(user: string) {
  let courseIDs: string[] = [];

  const registeredCourses = await getUserCourses(user);

  courseIDs = courseIDs.concat(registeredCourses.courses.map((course) => {
    return course.courseID;
  }));

  return getCourseConfigs(courseIDs);
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
    if (crs.settings === null || crs.settings === undefined) {
      crs.settings = {};
    }
    settings.forEach(setting => {
      crs.settings[setting.key] = setting.value;
    });

    return getUserDB(user).put(doc);
  })
}

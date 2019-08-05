import pouch from 'pouchdb-browser';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';

const coursedbLookup = 'coursedb-lookup';

const courseLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + coursedbLookup,
  {
    skip_setup: true
  }
);

// export async function incrementCourseMembership(courseID: string) {
//   courseDB.get<CourseConfig>(courseID).then( (course) => {
//     course.
//   })
// }

export async function getCourseList() {
  return courseLookupDB.allDocs<CourseConfig>({
    include_docs: true
  });
}

export async function getCourseConfig(courseID: string) {
  const config = await getCourseConfigs([courseID]);
  return config.rows[0].doc;
}

export async function getCourseConfigs(ids: string[]) {
  return courseLookupDB.allDocs<CourseConfig>({
    include_docs: true,
    keys: ids
  });
}

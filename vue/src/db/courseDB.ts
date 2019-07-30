import pouch from 'pouchdb-browser';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';

const coursedbLookup = 'coursedb-lookup';

const courseDB: PouchDB.Database = new pouch(
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
  return courseDB.allDocs<CourseConfig>({
    include_docs: true
  });
}

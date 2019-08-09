import pouch from 'pouchdb-browser';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import { pouchDBincludeCredentialsConfig } from '.';
import { log } from 'util';

const courseLookupDBTitle = 'coursedb-lookup';

const courseLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + courseLookupDBTitle,
  {
    skip_setup: true
  }
);

function getCourseDB(courseID: string) {
  const dbName = `coursedb-${courseID}`;
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL +
    '://' +
    ENV.COUCHDB_SERVER_URL + dbName,
    pouchDBincludeCredentialsConfig
  );
}

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

/**
 * Returns a list of registered datashapes for the specified
 * course.
 * @param courseID The ID of the course
 */
export async function getCourseDataShapes(courseID: string) {
  const cfg = await getCourseConfig(courseID);
  return cfg!.dataShapes;
}

export async function getCredentialledDataShapes(courseID: string) {
  const cfg = await getCredentialledCourseConfig(courseID);

  return cfg.dataShapes;
}

export async function getCourseQuestionTypes(courseID: string) {
  const cfg = await getCourseConfig(courseID);
  return cfg!.questionTypes;
}

export async function getCourseConfig(courseID: string) {
  const config = await getCourseConfigs([courseID]);
  return config.rows[0].doc;
}

export async function getCredentialledCourseConfig(courseID: string) {
  const db = getCourseDB(courseID);
  const ret = await db.get<CourseConfig>('CourseConfig');
  log(`Returning corseconfig:

  ${JSON.stringify(ret)}
  `);

  return ret;
}

export async function updateCredentialledCourseConfig(courseID: string, config: CourseConfig) {
  log(`Updating courseconfig:

${JSON.stringify(config)}
`);

  const db = getCourseDB(courseID);
  const old = await getCredentialledCourseConfig(courseID);

  return (await db.put<CourseConfig>({
    ...config,
    _rev: old._rev
  }));
}

export async function getCourseConfigs(ids: string[]) {
  return courseLookupDB.allDocs<CourseConfig>({
    include_docs: true,
    keys: ids
  });
}

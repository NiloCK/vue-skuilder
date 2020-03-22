import ENV from '@/ENVIRONMENT_VARS';
import { ClassroomConfig } from '@/server/types';
import pouch from 'pouchdb-browser';
import { pouchDBincludeCredentialsConfig } from '.';

const classroomLookupDBTitle = 'classdb-lookup';
export const CLASSROOM_CONFIG = 'ClassroomConfig';

const classroomLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + classroomLookupDBTitle,
  {
    skip_setup: true
  }
);

export function getClassroomDB(classID: string, version: 'student' | 'teacher'): PouchDB.Database {
  const dbName = `classdb-${version}-${classID}`;
  console.log(`Retrieving classroom db: ${dbName}`);

  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' +
    ENV.COUCHDB_SERVER_URL + dbName,
    pouchDBincludeCredentialsConfig
  );
}

export async function getClassroomConfig(classID: string): Promise<ClassroomConfig> {
  return await getClassroomDB(classID, "student").get<ClassroomConfig>(CLASSROOM_CONFIG);
}

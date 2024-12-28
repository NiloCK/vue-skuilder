import Nano = require('nano');
import process from 'process';
import ENV from '../utils/env';
import logger from '../logger';

const url = ENV.COUCHDB_SERVER;
const protocol: string = ENV.COUCHDB_PROTOCOL;

const admin = {
  username: ENV.COUCHDB_ADMIN,
  password: ENV.COUCHDB_PASSWORD,
};
const credentialCouchURL = `${protocol}://${admin.username}:${admin.password}@${url}`;

logger.info('WORKING DIRECTORY: ' + process.cwd());
logger.info(
  `CouchDB url: ${url}
    protocol: ${protocol}
    credentials:
    \tusername: ${admin.username}
    \tpassword: *****
    credUrl: ${protocol}://${admin.username}:*****@${url}
    `
);

const CouchDB = Nano(credentialCouchURL);

export async function useOrCreateCourseDB(courseID: string): Promise<Nano.DocumentScope<unknown>> {
  return useOrCreateDB(`coursedb-${courseID}`);
}

export async function useOrCreateDB(dbName: string): Promise<Nano.DocumentScope<unknown>> {
  const ret = CouchDB.use(dbName);

  try {
    await ret.info();
    return ret;
  } catch (err) {
    try {
      await CouchDB.db.create(dbName);
      return ret;
    } catch (createErr) {
      // If error is "database already exists", return existing db
      if (createErr.statusCode === 412) {
        return ret;
      }
      throw createErr;
    }
  }
}

export async function docCount(dbName: string): Promise<number> {
  const db = await useOrCreateDB(dbName);
  const info = await db.info();
  return info.doc_count;
}

export interface SecurityObject extends Nano.MaybeDocument {
  admins: {
    names: string[];
    roles: string[];
  };
  members: {
    names: string[];
    roles: string[];
  };
}

export const COUCH_URL_WITH_PROTOCOL = protocol + '://' + process.env.COUCHDB_SERVER;

export default CouchDB;

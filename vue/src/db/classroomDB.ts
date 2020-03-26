import ENV from '@/ENVIRONMENT_VARS';
import { ClassroomConfig } from '@/server/types';
import pouch from 'pouchdb-browser';
import { pouchDBincludeCredentialsConfig } from '.';
import moment from 'moment';

const classroomLookupDBTitle = 'classdb-lookup';
export const CLASSROOM_CONFIG = 'ClassroomConfig';

export type AssignedContent = AssignedCourse | AssignedTag;

interface AssignedTag extends ContentBase {
  type: 'tag';
  tagID: string;
}
interface AssignedCourse extends ContentBase {
  type: 'course';
}

interface ContentBase {
  type: 'course' | 'tag';
  /**
   * Username of the assigning teacher.
   */
  assignedBy: string;
  /**
   * Date the content was assigned.
   */
  assignedOn?: moment.Moment;
  /**
   * A 'due' date for this assigned content, for scheduling content
   * in advance. Content will not be actively pushed to students until
   * this date.
   */
  activeOn?: moment.Moment;
  courseID: string;
}


/**
 * Interface for managing a classroom.
 */
export default class TeacherClassroomDB {
  private _db: PouchDB.Database;
  private _stuDb: PouchDB.Database;
  private _cfg: ClassroomConfig;
  private _initComplete: boolean = false;

  constructor(classID: string) {
    const dbName = `classdb-teacher-${classID}`;
    const stuDbName = `classdb-student-${classID}`;

    this._db = new pouch(
      ENV.COUCHDB_SERVER_PROTOCOL + '://' +
      ENV.COUCHDB_SERVER_URL + dbName,
      pouchDBincludeCredentialsConfig
    );
    this._stuDb = new pouch(
      ENV.COUCHDB_SERVER_PROTOCOL + '://' +
      ENV.COUCHDB_SERVER_URL + stuDbName,
      pouchDBincludeCredentialsConfig
    );
    try {
      this._db.get<ClassroomConfig>(CLASSROOM_CONFIG).then((cfg) => {
        this._cfg = cfg;
        this._initComplete = true;
      });
    } catch (e) {
      throw new Error(`Error in TeacherClassroomDB constructor: ${JSON.stringify(e)}`);
    }
  }

  public get ready(): boolean {
    return this._initComplete;
  }


  private readonly _prefix: string = 'content';
  private getContentId(content: AssignedContent): string {
    if (content.type === 'tag') {
      return `${this._prefix}-${content.courseID}-${content.tagID}`;
    } else {
      return `${this._prefix}-${content.courseID}`;
    }
  }

  public async removeContent(content: AssignedContent) {
    const contentID = this.getContentId(content);

    this._db.get(contentID).then((doc) => {
      this._db.remove(doc)
    }).then(() => {
      this._db.replicate.to(this._stuDb, {
        doc_ids: [contentID]
      });
    });
  }

  public async assignContent(content: AssignedContent) {

    let put: PouchDB.Core.Response;
    let id: string = this.getContentId(content);

    if (content.type === 'tag') {
      put = await this._db.put<AssignedTag>({
        courseID: content.courseID,
        tagID: content.tagID,
        type: 'tag',
        _id: id,
        assignedBy: content.assignedBy,
        assignedOn: moment.utc(),
        activeOn: content.activeOn || moment.utc()
      });
    } else {
      put = await this._db.put<AssignedCourse>({
        courseID: content.courseID,
        type: 'course',
        _id: id,
        assignedBy: content.assignedBy,
        assignedOn: moment.utc(),
        activeOn: content.activeOn || moment.utc()
      });
    }

    if (put.ok) {
      this._db.replicate.to(this._stuDb, {
        doc_ids: [id]
      });
      return true;
    } else {
      return false;
    }
  }

  public async getAssignedContent(): Promise<AssignedContent[]> {
    console.log(`Getting assigned content...`);
    // see couchdb docs 6.2.2:
    //   Guide to Views -> Views Collation -> String Ranges
    let docRows = await this._db.allDocs<AssignedContent>({
      startkey: this._prefix,
      endkey: this._prefix + `\ufff0`,
      include_docs: true
    });

    let ret = docRows.rows.map((row) => {
      return row.doc!;
    });
    console.log(`Assigned content: ${JSON.stringify(ret)}`);

    return ret;
  }

  public getConfig(): ClassroomConfig {

    return this._cfg;
  }
}

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

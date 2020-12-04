import ENV from '@/ENVIRONMENT_VARS';
import { ClassroomConfig } from '@/server/types';
import moment from 'moment';
import pouch from 'pouchdb-browser';
import { getCourseDB, getStartAndEndKeys, pouchDBincludeCredentialsConfig, REVIEW_TIME_FORMAT } from '.';
import { StudyContentSource, StudySessionItem } from './contentSource';
import { CourseDB, getTag } from './courseDB';
import { ScheduledCard, User } from './userDB';

const classroomLookupDBTitle = 'classdb-lookup';
export const CLASSROOM_CONFIG = 'ClassroomConfig';

export type ClassroomMessage = {

}

export type AssignedContent = AssignedCourse | AssignedTag | AssignedCard;

interface AssignedTag extends ContentBase {
  type: 'tag';
  tagID: string;
}
interface AssignedCourse extends ContentBase {
  type: 'course';
}
interface AssignedCard extends ContentBase {
  type: 'card';
  cardID: string;
}

interface ContentBase {
  type: 'course' | 'tag' | 'card';
  /**
   * Username of the assigning teacher.
   */
  assignedBy: string;
  /**
   * Date the content was assigned.
   */
  assignedOn: moment.Moment;
  /**
   * A 'due' date for this assigned content, for scheduling content
   * in advance. Content will not be actively pushed to students until
   * this date.
   */
  activeOn: moment.Moment;
  courseID: string;
}

abstract class ClassroomDBBase {
  public _id: string;
  protected _db: PouchDB.Database;
  protected _cfg: ClassroomConfig;
  protected _initComplete: boolean = false;

  protected readonly _content_prefix: string = 'content';
  protected get _content_searchkeys() {
    return getStartAndEndKeys(this._content_prefix);
  }

  protected abstract async init(): Promise<void>;

  public async getAssignedContent(): Promise<AssignedContent[]> {
    console.log(`Getting assigned content...`);
    // see couchdb docs 6.2.2:
    //   Guide to Views -> Views Collation -> String Ranges
    let docRows = await this._db.allDocs<AssignedContent>({
      startkey: this._content_prefix,
      endkey: this._content_prefix + `\ufff0`,
      include_docs: true
    });

    let ret = docRows.rows.map((row) => {
      return row.doc!;
    });
    // console.log(`Assigned content: ${JSON.stringify(ret)}`);

    return ret;
  }

  protected getContentId(content: AssignedContent): string {
    if (content.type === 'tag') {
      return `${this._content_prefix}-${content.courseID}-${content.tagID}`;
    } else {
      return `${this._content_prefix}-${content.courseID}`;
    }
  }

  public get ready(): boolean {
    return this._initComplete;
  }
  public getConfig(): ClassroomConfig {
    return this._cfg;
  }

}

export class StudentClassroomDB extends ClassroomDBBase implements StudyContentSource {
  private readonly _prefix: string = 'content';
  private userMessages: PouchDB.Core.Changes<{}>;

  private constructor(classID: string) {
    super();
    this._id = classID;
    this.init();
  }

  async init() {
    const dbName = `classdb-student-${this._id}`;
    this._db = new pouch(ENV.COUCHDB_SERVER_PROTOCOL + '://' +
      ENV.COUCHDB_SERVER_URL + dbName, pouchDBincludeCredentialsConfig);
    try {
      const cfg = await this._db.get<ClassroomConfig>(CLASSROOM_CONFIG);
      this._cfg = cfg;
      this.userMessages = this._db.changes({
        since: 'now',
        live: true,
        include_docs: true
      });
      this._initComplete = true;
      return;
    }
    catch (e) {
      throw new Error(
        `Error in StudentClassroomDB constructor: ${JSON.stringify(e)}`
      );
    }
  }

  public static async factory(classID: string): Promise<StudentClassroomDB> {
    let ret = new StudentClassroomDB(classID);
    await ret.init();
    return ret;
  }

  public setChangeFcn(f: (value: any) => {}) {
    // todo: make this into a view request, w/ the user's name attached
    // todo: requires creating the view doc on classroom create in /express
    this.userMessages.on('change', f);
  }

  public async getPendingReviews(): Promise<(StudySessionReviewItem & ScheduledCard)[]> {
    const u = await User.instance();
    return (await (u.getPendingReviews()))
      .filter(r => r.scheduledFor === 'classroom' &&
        r.schedulingAgentId === this._id)
      .map(r => {

        return {
          ...r,
          qualifiedID: r.courseId + '-' + r.cardId,
          courseID: r.courseId,
          cardID: r.cardId,
          contentSourceType: 'classroom',
          contentSourceID: this._id,
          reviewID: r._id
        }
      });
  }

  public async getNewCards(): Promise<StudySessionItem[]> {
    const now = moment.utc();
    const assigned = await this.getAssignedContent();
    const due = assigned.filter(
      c => now.isAfter(moment.utc(c.activeOn, REVIEW_TIME_FORMAT))
    );

    console.log(`Due content: ${JSON.stringify(due)}`);

    let ret: StudySessionItem[] = [];

    for (let i = 0; i < due.length; i++) {
      const content = due[i];

      if (content.type === 'course') {
        const db = new CourseDB(content.courseID);
        ret = ret.concat(
          await db.getNewCards()
        );
      } else if (content.type === 'tag') {
        const tagDoc = await getTag(content.courseID, content.tagID);

        ret = ret.concat(
          tagDoc
            .taggedCards
            .map(c => {
              return {
                courseID: content.courseID,
                cardID: c,
                qualifiedID: `${content.courseID}-${c}`,
                contentSourceType: 'classroom',
                contentSourceID: this._id,
              };
            })
        );
      } else if (content.type === 'card') {
        // returning card docs - not IDs
        ret.push(await getCourseDB(content.courseID).get(content.cardID));
      }
    }

    console.log(`New Cards from classroom ${this._cfg.name}: ${ret}`);

    return ret;
  }
}


/**
 * Interface for managing a classroom.
 */
export default class TeacherClassroomDB extends ClassroomDBBase {
  private _stuDb: PouchDB.Database;

  private constructor(classID: string) {
    super();
    this._id = classID;
  }

  async init() {
    const dbName = `classdb-teacher-${this._id}`;
    const stuDbName = `classdb-student-${this._id}`;
    this._db = new pouch(ENV.COUCHDB_SERVER_PROTOCOL + '://' +
      ENV.COUCHDB_SERVER_URL + dbName, pouchDBincludeCredentialsConfig);
    this._stuDb = new pouch(ENV.COUCHDB_SERVER_PROTOCOL + '://' +
      ENV.COUCHDB_SERVER_URL + stuDbName, pouchDBincludeCredentialsConfig);
    try {
      return this._db.get<ClassroomConfig>(CLASSROOM_CONFIG).then((cfg) => {
        this._cfg = cfg;
        this._initComplete = true;
      }).then(() => {
        return;
      });
    }
    catch (e) {
      throw new Error(`Error in TeacherClassroomDB constructor: ${JSON.stringify(e)}`);
    }
  }

  public static async factory(classID: string): Promise<TeacherClassroomDB> {
    let ret = new TeacherClassroomDB(classID);
    await ret.init();
    return ret;
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
}

export const ClassroomLookupDB: PouchDB.Database = new pouch(
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

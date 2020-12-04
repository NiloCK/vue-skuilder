import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses, { NameSpacer, ShapeDescriptor } from '@/courses';
import { FieldType } from '@/enums/FieldType';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import _ from 'lodash';
import pouch from 'pouchdb-browser';
import { log } from 'util';
import { filterAlldocsByPrefix, pouchDBincludeCredentialsConfig } from '.';
import { StudyContentSource, StudySessionItem } from './contentSource';
import { CardData, DisplayableData, DocType, Tag, TagStub } from './types';
import { ScheduledCard, User } from './userDB';

const courseLookupDBTitle = 'coursedb-lookup';

const courseLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + courseLookupDBTitle,
  {
    skip_setup: true
  }
);

export class CourseDB implements StudyContentSource {
  private log(msg: string): void {
    log(`CourseLog: ${this.id}\n  ${msg}`);
  }

  private db: PouchDB.Database;
  private id: string;

  constructor(id: string) {
    this.id = id;
    this.db = getCourseDB(this.id);
  }

  public async getStudySession(cardLimit: number = 99) {
    // cardLimit = cardLimit ? cardLimit : 999;
    const u = await User.instance();
    const userCrsdoc = await u.getCourseRegDoc(this.id);
    const activeCards = await u.getActiveCards(this.id);

    // this.log()
    const newCards = (await this.getCardsByELO(userCrsdoc!.elo, cardLimit))
      .filter((card) => {

        return activeCards.indexOf(card) === -1;
      });


    // get scheduled reviews ... .... .....
    return newCards;
  }
  public async getPendingReviews(): Promise<(StudySessionReviewItem & ScheduledCard)[]> {
    const u = await User.instance();
    return (await u.getPendingReviews(this.id)).map(r => {
      return {
        ...r,
        contentSourceType: 'course',
        contentSourceID: this.id,
        cardID: r.cardId,
        courseID: r.courseId,
        qualifiedID: r.courseId + '-' + r.cardId,
      };
    });
  }
  public async getNewCards(limit: number = 99): Promise<StudySessionItem[]> {
    const u = await User.instance();
    let elo = -1;
    try {
      elo = (await u.getCourseRegistrationsDoc()).courses.find(c => {
        return c.courseID === this.id
      })!.elo;
    } catch {
      elo = 1000;
    }

    const cards = await this.getCardsByELO(elo, limit);
    return cards.map(c => {
      const split = c.split('-');
      return {
        courseID: this.id,
        cardID: split[1],
        qualifiedID: c,
        contentSourceType: 'course',
        contentSourceID: this.id
      };
    });
  }

  private async getCardsByELO(elo: number, cardLimit?: number) {
    elo = parseInt(elo as any);
    const limit = cardLimit ? cardLimit : 25;

    let below: PouchDB.Query.Response<any>;
    let above: PouchDB.Query.Response<any>;
    below = await this.db.query('elo', {
      limit: Math.ceil(limit / 2),
      startkey: elo,
      descending: true
    });

    const aboveLimit = limit - below.rows.length;

    above = await this.db.query('elo', {
      limit: aboveLimit,
      startkey: elo + 1,
    });
    // this.log(JSON.stringify(below));

    let cards = below.rows;
    cards = cards.concat(above.rows);

    let ret = cards.sort((a, b) => {
      let s = Math.abs(a.key - elo) - Math.abs(b.key - elo);
      if (s === 0) {
        return Math.random() - 0.5;
      } else {
        return s;
      }
    }).map(c => `${this.id}-${c.id}-${c.key}`);


    const str = `below:\n${below.rows.map(r => `\t${r.id}-${r.key}\n`)}

above:\n${above.rows.map(r => `\t${r.id}-${r.key}\n`)}`;

    this.log(`Getting ${limit} cards centered around elo: ${elo}:\n\n` + str);

    return ret;
  }
}

function getCourseDB(courseID: string): PouchDB.Database {
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

export async function getCourseName(courseID: string): Promise<string> {
  let ret = ((await courseLookupDB.get(courseID)) as any)['name'];
  console.log(ret);
  return ret;
}

export async function removeCourse(courseID: string) {
  return courseLookupDB.get(courseID).then((course) => {
    return courseLookupDB.remove({
      ...course
    });
  });
}

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

export async function getCardDataShape(courseID: string, cardID: string) {
  const dataShapes: DataShape[] = [];
  Courses.courses.forEach((course) => {
    course.questions.forEach((question) => {
      question.dataShapes.forEach((ds) => {
        dataShapes.push(ds);
      });
    });
  });

  // log(`Datashapes: ${JSON.stringify(dataShapes)}`);

  const db = await getCourseDB(courseID);
  const card = await db.get<CardData>(cardID);
  const disp = await db.get<DisplayableData>(card.id_displayable_data[0]);
  const cfg = await db.get<CourseConfig>('CourseConfig');

  // log(`Config: ${JSON.stringify(cfg)}`);
  // log(`DisplayableData: ${JSON.stringify(disp)}`);

  const dataShape = cfg!.dataShapes.find((ds) => {
    return ds.name === disp.id_datashape;
  });

  const ret = dataShapes.find((ds) => {
    return ds.name === NameSpacer.getDataShapeDescriptor(dataShape!.name).dataShape;
  })!;

  log(`Returning ${JSON.stringify(ret)}`);
  return ret;
}

export async function addNote55(
  courseID: string,
  codeCourse: string,
  shape: DataShape,
  data: any,
  author?: string
) {
  // alert(`Course id: ${courseID}`);
  const db = await getCourseDB(courseID);

  const dataShapeId = NameSpacer.getDataShapeString({
    course: codeCourse,
    dataShape: shape.name
  });

  const attachmentFields = shape.fields.filter((field) => {
    return (
      field.type === FieldType.IMAGE ||
      field.type === FieldType.AUDIO
    );
  });

  const attachments: { [index: string]: PouchDB.Core.FullAttachment } = {};
  const payload: DisplayableData = {
    course: courseID,
    data: [],
    docType: DocType.DISPLAYABLE_DATA,
    id_datashape: dataShapeId
  };

  if (author) {
    payload.author = author;
  }

  if (attachmentFields.length !== 0) {
    attachmentFields.forEach((attField) => {
      attachments[attField.name] = data[attField.name];
    });
    payload._attachments = attachments;
  }

  shape.fields.filter((field) => {
    return field.type !== FieldType.IMAGE
      && field.type !== FieldType.AUDIO;
  }).forEach((field) => {
    payload.data.push({
      name: field.name,
      data: data[field.name]
    });
  });

  const result = await db.post<DisplayableData>(payload);

  if (result.ok) {
    // create cards
    createCards(courseID, dataShapeId, result.id);
  }

  return result;
}

function getTagID(tagName: string): string {
  const tagPrefix = DocType.TAG.valueOf() + '-';
  if (tagName.indexOf(tagPrefix) === 0) {
    return tagName;
  } else {
    return tagPrefix + tagName;
  }
}

// todo: this is actually returning full tag docs now.
//       - performance issue when tags have lots of
//         applied docs
//       - will require a computed couch DB view
export async function getCourseTagStubs(courseID: string):
  Promise<PouchDB.Core.AllDocsResponse<Tag>> {
  log(`Getting tag stubs for course: ${courseID}`);
  const stubs = await filterAlldocsByPrefix<Tag>(
    getCourseDB(courseID),
    DocType.TAG.valueOf() + '-'
  );

  stubs.rows.forEach((row) => {
    log(`\tTag stub for doc: ${row.id}`);
  });

  return stubs;
}

export async function deleteTag(courseID: string, tagName: string) {
  tagName = getTagID(tagName);
  const courseDB = getCourseDB(courseID);
  const doc = await courseDB.get<Tag>(
    DocType.TAG.valueOf() + '-' + tagName
  );
  const resp = await courseDB.remove(doc);
  return resp;
}

export async function createTag(courseID: string, tagName: string) {
  log(`Creating tag: ${tagName}...`);
  const tagID = getTagID(tagName);
  const courseDB = getCourseDB(courseID);
  const resp = await courseDB.put<Tag>({
    course: courseID,
    docType: DocType.TAG,
    name: tagName,
    snippit: '',
    taggedCards: [],
    wiki: '',
    _id: tagID
  });
  return resp;
}

export async function getTag(courseID: string, tagName: string) {
  const tagID = getTagID(tagName);
  const courseDB = await getCourseDB(courseID);
  return courseDB.get<Tag>(tagID);
}

export async function addTagToCard(courseID: string, cardID: string, tagID: string):
  Promise<PouchDB.Core.Response> {
  // todo: possible future perf. hit if tags have large #s of taggedCards.
  // In this case, should be converted to a server-request
  const prefixedTagID = getTagID(tagID);
  const courseDB = getCourseDB(courseID);
  try {
    log(`Applying tag ${tagID} to card ${courseID + '-' + cardID}...`);
    const tag = await courseDB.get<Tag>(prefixedTagID);
    tag.taggedCards.push(cardID);
    return courseDB.put<Tag>(tag);
  } catch (e) {
    log(`Tag ${tagID} does not exist...`);
    await createTag(courseID, tagID);
    return addTagToCard(courseID, cardID, tagID);
  }
}

export async function removeTagFromCard(courseID: string, cardID: string, tagID: string) {
  // todo: possible future perf. hit if tags have large #s of taggedCards.
  // In this case, should be converted to a server-request
  tagID = getTagID(tagID);
  const courseDB = getCourseDB(courseID);
  const tag = await courseDB.get<Tag>(tagID);
  _.remove(tag.taggedCards, (taggedID) => {
    return cardID === taggedID;
  });
  return courseDB.put<Tag>(tag);
}

/**
 * Returns an array of ancestor tag IDs, where:
 * return[0] = parent,
 * return[1] = grandparent,
 * return[2] = great grandparent,
 * etc.
 *
 * If ret is empty, the tag itself is a root
 */
export function getAncestorTagIDs(courseID: string, tagID: string): string[] {
  tagID = getTagID(tagID);
  const split = tagID.split('>');
  if (split.length === 1) {
    return [];
  } else {
    split.pop();
    const parent = split.join('>');
    return [parent].concat(getAncestorTagIDs(courseID, parent));
  }
}

export async function getChildTagStubs(courseID: string, tagID: string) {
  return await filterAlldocsByPrefix(getCourseDB(courseID), tagID + '>');
}

export async function getAppliedTags(id_course: string, id_card: string) {
  const db = await getCourseDB(id_course);

  const result = await db.query<TagStub>('getTags',
    {
      startkey: id_card,
      endkey: id_card
      // include_docs: true
    });

  log(`getAppliedTags looked up: ${id_card}`);
  log(`getAppliedTags returning: ${JSON.stringify(result)}`);

  return result;
}

async function createCards(
  courseID: string,
  datashapeID: PouchDB.Core.DocumentId,
  noteID: PouchDB.Core.DocumentId) {
  const cfg = await getCredentialledCourseConfig(courseID);
  const dsDescriptor = NameSpacer.getDataShapeDescriptor(datashapeID);
  let questionViewTypes: string[] = [];

  for (const ds of cfg.dataShapes) {
    if (ds.name === datashapeID) {
      questionViewTypes = ds.questionTypes;
    }
  }

  for (const questionView of questionViewTypes) {
    createCard(questionView, courseID, dsDescriptor, noteID);
  }
}

async function createCard(
  questionViewName: string,
  courseID: string,
  dsDescriptor: ShapeDescriptor,
  noteID: string
) {
  const qDescriptor = NameSpacer.getQuestionDescriptor(questionViewName);
  const cfg = await getCredentialledCourseConfig(courseID);

  for (const rQ of cfg.questionTypes) {
    if (rQ.name === questionViewName) {
      for (const view of rQ.viewList) {
        addCard(courseID, dsDescriptor.course, [noteID], NameSpacer.getViewString({
          course: qDescriptor.course,
          questionType: qDescriptor.questionType,
          view
        }));
      }
    }
  }
}

export async function updateCardElo(courseID: string, cardID: string, elo: number) {
  if (elo) { // checking against null, undefined, NaN
    const cDB = getCourseDB(courseID);
    const card = await cDB.get<CardData>(cardID);
    card.elo = elo;
    return cDB.put(card); // race conditions - how to handle - is it important? probably not
  }
}

/**
 * Adds a card to the DB. This function is called
 * as a side effect of adding either a View or
 * DisplayableData item.
 * @param course The name of the course that the card belongs to
 * @param id_displayable_data C/PouchDB ID of the data used to hydrate the view
 * @param id_view C/PouchDB ID of the view used to display the card
 */
function addCard(
  courseID: string,
  course: string,
  id_displayable_data: PouchDB.Core.DocumentId[],
  id_view: PouchDB.Core.DocumentId,
  elo?: number) {
  return getCourseDB(courseID).post<CardData>({
    course,
    id_displayable_data,
    id_view,
    docType: DocType.CARD,
    elo: elo || 990 + Math.round(20 * Math.random())
  });
}

export async function getCredentialledCourseConfig(courseID: string) {
  const db = getCourseDB(courseID);
  const ret = await db.get<CourseConfig>('CourseConfig');
  ret.courseID = courseID;
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

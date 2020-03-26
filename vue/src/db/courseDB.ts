import pouch from 'pouchdb-browser';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import { pouchDBincludeCredentialsConfig, filterAlldocsByPrefix } from '.';
import { log } from 'util';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import { FieldType } from '@/enums/FieldType';
import { DisplayableData, DocType, CardData, Tag, TagStub } from './types';
import Courses from '@/courses';
import _ from 'lodash';


// *someday...*
// class CourseDB implements PouchDB.Database {
//   private db: PouchDB.Database;
//   id: string;
//
//   config(): CourseConfig { ... }
// }

const courseLookupDBTitle = 'coursedb-lookup';

const courseLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' +
  ENV.COUCHDB_SERVER_URL + courseLookupDBTitle,
  {
    skip_setup: true
  }
);

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

  const result = await db.query<TagStub>('getTags/get-tags',
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
  let questions: string[] = [];

  for (const ds of cfg.dataShapes) {
    if (ds.name === datashapeID) {
      questions = ds.questionTypes;
    }
  }

  for (const q of questions) {
    const qDescriptor = NameSpacer.getQuestionDescriptor(q);

    for (const rQ of cfg.questionTypes) {
      if (rQ.name === q) {
        for (const view of rQ.viewList) {
          addCard(
            courseID,
            dsDescriptor.course,
            [noteID],
            NameSpacer.getViewString({
              course: qDescriptor.course,
              questionType: qDescriptor.questionType,
              view
            })
          );
        }
      }
    }
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
  id_view: PouchDB.Core.DocumentId) {
  return getCourseDB(courseID).post<CardData>({
    course,
    id_displayable_data,
    id_view,
    docType: DocType.CARD
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

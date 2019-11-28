import pouch from 'pouchdb-browser';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import { pouchDBincludeCredentialsConfig } from '.';
import { log } from 'util';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import { FieldType } from '@/enums/FieldType';
import { DisplayableData, DocType, CardData } from './types';


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

export function getAppliedTags(id_course: string, id_card: string) {
  return getCourseDB(id_course).find({
    selector: {
      startkey: id_card,
      endkey: id_card
    },
    use_index: ['getTags', 'get-tags']
  });
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

import pouch from 'pouchdb-browser';
import { pouchDBincludeCredentialsConfig } from '.';
import ENV from '../ENVIRONMENT_VARS';
import { DataShape } from '../base-course/Interfaces/DataShape';
import { FieldDefinition } from '../base-course/Interfaces/FieldDefinition';
import { NameSpacer, ShapeDescriptor } from '../courses/NameSpacer';
import { FieldType } from '../enums/FieldType';
import { CourseConfig } from '../server/types';
import { CourseElo, blankCourseElo, toCourseElo } from '../tutor/Elo';
import { CourseDB, createTag, updateCardElo } from './courseDB';
import { CardData, DisplayableData, DocType, Tag } from './types';

/**
 *
 * @param courseID id of the course (quilt) being added to
 * @param codeCourse
 * @param shape
 * @param data the datashape data - data required for this shape
 * @param author
 * @param uploads optional additional media uploads: img0, img1, ..., aud0, aud1,...
 * @returns
 */

export async function addNote55(
  courseID: string,
  codeCourse: string,
  shape: DataShape,
  data: any,
  author: string,
  tags: string[],
  uploads?: { [x: string]: PouchDB.Core.FullAttachment }
) {
  const db = await getCourseDB(courseID);

  const dataShapeId = NameSpacer.getDataShapeString({
    course: codeCourse,
    dataShape: shape.name,
  });

  const attachmentFields = shape.fields
    .map((field) => {
      // make a copy, in order NOT to append to the datashape
      const copy: FieldDefinition = {
        name: field.name,
        type: field.type,
      };
      return copy;
    })
    .filter((field) => {
      return field.type === FieldType.IMAGE || field.type === FieldType.AUDIO;
    })
    .concat([
      {
        name: 'autoplayAudio',
        type: FieldType.AUDIO,
      },
    ]);

  for (let i = 1; i < 11; i++) {
    if (data[`audio-${i}`]) {
      attachmentFields.push({
        name: `audio-${i}`,
        type: FieldType.AUDIO,
      });
    }

    if (data[`image-${i}`]) {
      attachmentFields.push({
        name: `image-${i}`,
        type: FieldType.IMAGE,
      });
    }
  }
  if (data[`audio-11`]) {
    throw new Error('Too many audio attachments');
  }
  if (data[`image-11`]) {
    throw new Error('Too many image attachments');
  }

  const attachments: { [index: string]: PouchDB.Core.FullAttachment } = {};
  const payload: DisplayableData = {
    course: courseID,
    data: [],
    docType: DocType.DISPLAYABLE_DATA,
    id_datashape: dataShapeId,
  };

  if (author) {
    payload.author = author;
  }

  attachmentFields.forEach((attField) => {
    attachments[attField.name] = data[attField.name];
  });

  //
  if (uploads) {
    Object.keys(uploads).forEach((k) => {
      attachments[k] = uploads[k];
    });
  }

  if (attachmentFields.length !== 0 || (uploads && Object.keys(uploads).length)) {
    payload._attachments = attachments;
  }

  shape.fields
    .filter((field) => {
      return field.type !== FieldType.IMAGE && field.type !== FieldType.AUDIO;
    })
    .forEach((field) => {
      payload.data.push({
        name: field.name,
        data: data[field.name],
      });
    });

  const result = await db.post<DisplayableData>(payload);

  if (result.ok) {
    // create cards
    const cards = await createCards(courseID, dataShapeId, result.id, tags);
  }

  return result;
}

export async function createCards(
  courseID: string,
  datashapeID: PouchDB.Core.DocumentId,
  noteID: PouchDB.Core.DocumentId,
  tags: string[]
) {
  const cfg = await getCredentialledCourseConfig(courseID);
  const dsDescriptor = NameSpacer.getDataShapeDescriptor(datashapeID);
  let questionViewTypes: string[] = [];

  for (const ds of cfg.dataShapes) {
    if (ds.name === datashapeID) {
      questionViewTypes = ds.questionTypes;
    }
  }

  for (const questionView of questionViewTypes) {
    createCard(questionView, courseID, dsDescriptor, noteID, tags);
  }
}

async function createCard(
  questionViewName: string,
  courseID: string,
  dsDescriptor: ShapeDescriptor,
  noteID: string,
  tags: string[]
) {
  tags.forEach((t) => console.log(`Adding ${t}!`));
  const qDescriptor = NameSpacer.getQuestionDescriptor(questionViewName);
  const cfg = await getCredentialledCourseConfig(courseID);

  for (const rQ of cfg.questionTypes) {
    if (rQ.name === questionViewName) {
      for (const view of rQ.viewList) {
        addCard(
          courseID,
          dsDescriptor.course,
          [noteID],
          NameSpacer.getViewString({
            course: qDescriptor.course,
            questionType: qDescriptor.questionType,
            view,
          }),
          blankCourseElo(),
          tags
        );
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
async function addCard(
  courseID: string,
  course: string,
  id_displayable_data: PouchDB.Core.DocumentId[],
  id_view: PouchDB.Core.DocumentId,
  elo: CourseElo,
  tags: string[]
) {
  const card = await getCourseDB(courseID).post<CardData>({
    course,
    id_displayable_data,
    id_view,
    docType: DocType.CARD,
    elo: elo || toCourseElo(990 + Math.round(20 * Math.random())),
  });
  tags.forEach((tag) => {
    console.log(`adding tag: ${tag} to card ${card.id}`);
    addTagToCard(courseID, card.id, tag);
  });
  return card;
}

export async function getCredentialledCourseConfig(courseID: string) {
  const db = getCourseDB(courseID);
  const ret = await db.get<CourseConfig>('CourseConfig');
  ret.courseID = courseID;
  console.log(`Returning corseconfig:

  ${JSON.stringify(ret)}
  `);

  return ret;
}

export async function addTagToCard(
  courseID: string,
  cardID: string,
  tagID: string
): Promise<PouchDB.Core.Response> {
  // todo: possible future perf. hit if tags have large #s of taggedCards.
  // In this case, should be converted to a server-request
  const prefixedTagID = getTagID(tagID);
  const courseDB = getCourseDB(courseID);
  const courseApi = new CourseDB(courseID);
  try {
    console.log(`Applying tag ${tagID} to card ${courseID + '-' + cardID}...`);
    const tag = await courseDB.get<Tag>(prefixedTagID);
    if (!tag.taggedCards.includes(cardID)) {
      tag.taggedCards.push(cardID);

      courseApi.getCardEloData([cardID]).then((eloData) => {
        const elo = eloData[0];
        elo.tags[tagID] = {
          count: 0,
          score: elo.global.score, // todo: or 1000?
        };
        updateCardElo(courseID, cardID, elo);
      });

      return courseDB.put<Tag>(tag);
    } else throw new Error(`Card already has this tag`);
  } catch (e) {
    console.log(`Tag ${tagID} does not exist...`);
    await createTag(courseID, tagID);
    return addTagToCard(courseID, cardID, tagID);
  }
}

export function getTagID(tagName: string): string {
  const tagPrefix = DocType.TAG.valueOf() + '-';
  if (tagName.indexOf(tagPrefix) === 0) {
    return tagName;
  } else {
    return tagPrefix + tagName;
  }
}

export function getCourseDB(courseID: string): PouchDB.Database {
  const dbName = `coursedb-${courseID}`;
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + dbName,
    pouchDBincludeCredentialsConfig
  );
}

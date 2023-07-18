import { DataShape } from '../base-course/Interfaces/DataShape';
import { FieldDefinition } from '../base-course/Interfaces/FieldDefinition';
import { FieldType } from '../enums/FieldType';
import { DisplayableData, DocType } from './types';
import { getCourseDB, createCards } from './courseDB';
import { NameSpacer } from '@/courses/NameSpacer';

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

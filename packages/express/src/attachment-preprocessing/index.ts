import CouchDB, { useOrCreateDB } from '../couchdb';
import nano = require('nano');
import { normalize } from './normalize';
import AsyncProcessQueue, { Result } from '../utils/processQueue';
import { COURSE_DB_LOOKUP } from '../client-requests/course-requests';
import logger from '../logger';

const Q = new AsyncProcessQueue<AttachmentProcessingRequest, Result>(processDocAttachments);

/**
 * Apply post-processing to a course database. Runs continuously.
 * @param courseID
 */
export function postProcessCourse(courseID: string): void {
  try {
    logger.info(`Following course ${courseID}`);

    const crsString = `coursedb-${courseID}`;

    CouchDB.db.follow(
      crsString,
      {
        feed: 'continuous',
        db: crsString,
        include_docs: false,
      },
      filterFactory(courseID)
    );
  } catch (e) {
    logger.error(`Error in postProcessCourse: ${e}`);
  }
}

/**
 * Connect to CouchDB, monitor changes to uploaded card data,
 * perform post-processing on uploaded media
 */
export default async function postProcess(): Promise<void> {
  try {
    logger.info(`Following all course databases for changes...`);
    const lookupDB = await useOrCreateDB(COURSE_DB_LOOKUP);
    const courses = await lookupDB.list({
      include_docs: true,
    });

    for (const course of courses.rows) {
      try {
        postProcessCourse(course.id);
      } catch (e) {
        logger.error(`Error processing course ${course.id}: ${e}`);
        throw e;
      }
    }
  } catch (e) {
    logger.error(`Error in postProcess: ${e}`);
  }
}

function filterFactory(courseID: string) {
  const courseDatabase = CouchDB.use(`coursedb-${courseID}`);

  return async function filterChanges(error, changeItem: nano.DatabaseChangesResultItem) {
    try {
      const docNoAttachments = await courseDatabase.get(changeItem.id, {
        attachments: false,
      });

      if (
        docNoAttachments._attachments &&
        Object.keys(docNoAttachments._attachments).length > 0 &&
        (docNoAttachments['processed'] === undefined || docNoAttachments['processed'] === false)
      ) {
        const doc = await courseDatabase.get(changeItem.id, {
          attachments: true,
        });
        const processingRequest: AttachmentProcessingRequest = {
          courseID,
          docID: doc._id,
          fields: [],
        };
        const atts = doc._attachments;
        for (const attachment in atts) {
          const content_type: string = atts[attachment]['content_type'];
          logger.info(
            `Course: ${courseID}\n\tAttachment ${attachment} in:\n\t${doc._id}\n should be processed...`
          );

          if (content_type.includes('audio')) {
            processingRequest.fields.push({
              name: attachment,
              mimetype: content_type,
            });
          }
        }
        Q.addRequest(processingRequest);
      }
    } catch (e) {
      logger.error(`Error processing doc ${changeItem.id}: ${e}`);
    }
  };
}

async function processDocAttachments(request: AttachmentProcessingRequest): Promise<Result> {
  if (request.fields.length == 0) {
    logger.info(`No attachments to process for ${request.docID}`);
    return {
      error: 'No attachments to process',
      ok: true,
      status: 'warning',
    };
  }
  const courseDatabase = CouchDB.use(`coursedb-${request.courseID}`);

  const doc = await courseDatabase.get(request.docID, {
    attachments: true,
    att_encoding_info: true,
  });

  for (const field of request.fields) {
    logger.info(`Converting ${field.name}`);
    const attachment = doc._attachments[field.name].data;
    if (field.mimetype.includes('audio')) {
      try {
        const converted = await normalize(attachment);
        field.returnData = converted;
      } catch (e) {
        logger.info(`Exception caught: ${e}`);
        throw e;
      }
    }
  }

  logger.info('Conversions finished');

  request.fields.forEach((field) => {
    logger.info(`Replacing doc Data for ${field.name}`);
    if (doc['processed']) {
      (doc['processed'] as string[]).push(field.name);
    } else {
      doc['processed'] = [field.name];
    }
    doc._attachments[field.name].data = field.returnData;
  });

  // request was a noop.
  // Mark as processed in order to avoid inifinte loop
  if (request.fields.length === 0) {
    doc['processed'] = true;
  }

  const resp: any = await courseDatabase.insert(doc);
  resp.status = 'ok';

  logger.info(`Processing request reinsert result: ${JSON.stringify(resp)}`);
  return resp;
}

interface DatabaseChangesResultItemWithDoc extends nano.DatabaseChangesResultItem {
  doc: nano.DocumentGetResponse;
  courseID: string;
}

interface AttachmentProcessingRequest {
  courseID: string;
  docID: string;
  fields: ProcessingField[];
}
interface ProcessingField {
  name: string;
  mimetype: string;
  returnData?: any;
}

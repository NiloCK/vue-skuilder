import Nano from 'nano';
import express from 'express';
import type { Request, Response } from 'express';
import {
  ServerRequest,
  ServerRequestType as RequestEnum,
  prepareNote55,
} from '@vue-skuilder/common';
import PostProcess from './attachment-preprocessing/index.js';
import {
  ClassroomCreationQueue,
  ClassroomJoinQueue,
  ClassroomLeaveQueue,
} from './client-requests/classroom-requests.js';
import {
  COURSE_DB_LOOKUP,
  CourseCreationQueue,
  initCourseDBDesignDocInsert,
} from './client-requests/course-requests.js';
import CouchDB, { useOrCreateCourseDB, useOrCreateDB } from './couchdb/index.js';
import { requestIsAuthenticated } from './couchdb/authentication.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as fileSystem from 'fs';
import ENV from './utils/env.js';
import morgan from 'morgan';
import logger from './logger.js';
import logsRouter from './routes/logs.js';
import { CourseConfig } from '@vue-skuilder/common';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

logger.info(`Express app running version: ${ENV.VERSION}`);

const port = 3000;
export const classroomDbDesignDoc = fileSystem.readFileSync(
  './assets/classroomDesignDoc.js',
  'utf-8'
);
export const courseDBDesignDoc = fileSystem.readFileSync(
  './assets/get-tagsDesignDoc.json',
  'utf-8'
);
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);
app.use('/logs', logsRouter);

export interface VueClientRequest extends express.Request {
  body: ServerRequest;
}

app.get('/courses', async (req: Request, res: Response) => {
  const coursesDB = await useOrCreateDB<CourseConfig>(COURSE_DB_LOOKUP);

  const courseStubs = await coursesDB.list({
    include_docs: true,
  });
  const courses = courseStubs.rows.map((stub) => {
    if (stub.doc) {
      return `${stub.id} - ${stub.doc['name']}`;
    } else {
      return `${stub.id} - [no name]`;
    }
  });
  res.send(courses);
});

app.get('/course/:courseID/config', async (req: Request, res: Response) => {
  const courseDB = await useOrCreateCourseDB(req.params.courseID);
  const cfg = await courseDB.get('CourseConfig'); // [ ] pull courseConfig docName into global const

  res.json(cfg);
});

app.delete('/course/:courseID', async (req: Request, res: Response) => {
  logger.info(`Delete request made on course ${req.params.courseID}...`);
  const auth = await requestIsAuthenticated(req);
  if (auth) {
    logger.info(`\tAuthenticated delete request made...`);
    const dbResp = await CouchDB.db.destroy(`coursedb-${req.params.courseID}`);
    if (!dbResp.ok) {
      res.json({ success: false, error: dbResp });
      return;
    }
    const lookupDB = await useOrCreateDB(COURSE_DB_LOOKUP);
    const lookupDoc = await lookupDB.get(req.params.courseID);
    const lookupResp = await lookupDB.destroy(
      req.params.courseID,
      lookupDoc._rev
    );
    if (lookupResp.ok) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: lookupResp });
    }
  } else {
    res.json({ success: false, error: 'Not authenticated' });
  }
});

async function postHandler(req: VueClientRequest, res: express.Response) {
  const auth = await requestIsAuthenticated(req);
  if (auth) {
    const body = req.body;
    logger.info(
      `Authorized ${
        body.type ? body.type : '[unspecified request type]'
      } request made...`
    );

    if (body.type === RequestEnum.CREATE_CLASSROOM) {
      const id: number = ClassroomCreationQueue.addRequest(body.data);
      body.response = await ClassroomCreationQueue.getResult(id);
      res.json(body.response);
    } else if (body.type === RequestEnum.DELETE_CLASSROOM) {
      // [ ] add delete classroom request
    } else if (body.type === RequestEnum.JOIN_CLASSROOM) {
      const id: number = ClassroomJoinQueue.addRequest(body.data);
      body.response = await ClassroomJoinQueue.getResult(id);
      res.json(body.response);
    } else if (body.type === RequestEnum.LEAVE_CLASSROOM) {
      const id: number = ClassroomLeaveQueue.addRequest({
        username: req.body.user,
        ...body.data,
      });
      body.response = await ClassroomLeaveQueue.getResult(id);
      res.json(body.response);
    } else if (body.type === RequestEnum.CREATE_COURSE) {
      const id: number = CourseCreationQueue.addRequest(body.data);
      body.response = await CourseCreationQueue.getResult(id);
      res.json(body.response);
    } else if (body.type === RequestEnum.ADD_COURSE_DATA) {
      const payload = prepareNote55(
        body.data.courseID,
        body.data.codeCourse,
        body.data.shape,
        body.data.data,
        body.data.author,
        body.data.tags,
        body.data.uploads
      );
      CouchDB.use(`coursedb-${body.data.courseID}`)
        .insert(payload as Nano.MaybeDocument)
        .then((r) => {
          logger.info(`\t\t\tCouchDB insert result: ${JSON.stringify(r)}`);
          res.json(r);
        })
        .catch((e) => {
          logger.info(`\t\t\tCouchDB insert error: ${JSON.stringify(e)}`);
          res.json(e);
        });
    }
  } else {
    logger.info(`\tREQUEST UNAUTHORIZED!`);
    res.status(401);
    res.statusMessage = 'Unauthorized';
    res.send();
  }
}

app.post('/', (req: Request, res: Response) => {
  postHandler(req, res);
});

app.get('/version', (req: Request, res: Response) => {
  res.send(ENV.VERSION);
});

app.get('/', (req: Request, res: Response) => {
  let status = `Express service is running.\nVersion: ${ENV.VERSION}\n`;

  CouchDB.session()
    .then((s) => {
      if (s.ok) {
        status += 'Couchdb is running.\n';
      } else {
        status += 'Couchdb session is NOT ok.\n';
      }
    })
    .catch((e) => {
      status += `Problems in the couch session! ${JSON.stringify(e)}`;
    })
    .finally(() => {
      res.send(status);
    });
});
let listening = false;

app.listen(port, () => {
  listening = true;
  logger.info(`Express app listening on port ${port}!`);
});

init();

async function init() {
  while (!listening) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    // start the change-listener that does post-processing on user
    // media uploads
    PostProcess();

    initCourseDBDesignDocInsert();

    useOrCreateDB('classdb-lookup');
    try {
      (await useOrCreateDB('coursedb')).insert(
        {
          validate_doc_update: classroomDbDesignDoc,
        } as Nano.MaybeDocument,
        '_design/_auth'
      );
    } catch (e) {
      logger.info(`Error: ${e}`);
    }
  } catch (e) {
    logger.info(`Error: ${JSON.stringify(e)}`);
  }
}

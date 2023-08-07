import Nano = require('nano');
import express from 'express';
import { ServerRequest, ServerRequestType as RequestEnum } from '../../vue/src/server/types';
import PostProcess from './attachment-preprocessing';
import {
  ClassroomCreationQueue,
  ClassroomJoinQueue,
  ClassroomLeaveQueue,
} from './client-requests/classroom-requests';
import {
  CourseCreationQueue,
  initCourseDBDesignDocInsert,
} from './client-requests/course-requests';
import CouchDB, { useOrCreateDB } from './couchdb';
import { requestIsAuthenticated } from './couchdb/authentication';
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import fileSystem = require('fs');
import { prepareNote55 } from '../../vue/src/db/prepareNote55';
import ENV from './utils/env';
import console from 'console';

console.log(`Express app running version: ${ENV.VERSION}`);

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
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

export interface VueClientRequest extends express.Request {
  body: ServerRequest;
}

app.get('/courses', async (req, res) => {
  const coursesDB = await useOrCreateDB(COURSE_DB_LOOKUP);
  
  const courseStubs = await coursesDB.list({
    include_docs: true
  })
  const courses = courseStubs.rows.map((stub) => {
    return `${stub.id} - ${stub.doc["name"]}`
  })
  res.send(courses);
});

app.delete('/course/:courseID', async (req, res) => {
  console.log(`Delete request made on course ${req.params.courseID}...`);
  const auth = await requestIsAuthenticated(req);
  if (auth) {
    console.log(`\tAuthenticated delete request made...`);
    const dbResp = await CouchDB.db.destroy(`coursedb-${req.params.courseID}`);
    if (!dbResp.ok) {
      res.json({ success: false, error: dbResp });
      return;
    }
    const lookupDB = await useOrCreateDB(COURSE_DB_LOOKUP);
    const lookupDoc = await lookupDB.get(req.params.courseID);
    const lookupResp = await lookupDB.destroy(req.params.courseID, lookupDoc._rev);
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
  console.log(`Request made...`);
  const auth = await requestIsAuthenticated(req);
  if (auth) {
    console.log(`\tAuthenticated request made...`);
    const data = req.body;

    if (data.type === RequestEnum.CREATE_CLASSROOM) {
      console.log(`\t\tCREATE_CLASSROOM request made...`);
      const id: number = ClassroomCreationQueue.addRequest(data.data);
      data.response = await ClassroomCreationQueue.getResult(id);
      res.json(data.response);
    } else if (data.type === RequestEnum.DELETE_CLASSROOM) {
      console.log(`\t\tDELETE_CLASSROOM request made...`);
    } else if (data.type === RequestEnum.JOIN_CLASSROOM) {
      console.log(`\t\tJOIN_CLASSROOM request made...`);
      const id: number = ClassroomJoinQueue.addRequest(data.data);
      data.response = await ClassroomJoinQueue.getResult(id);
      res.json(data.response);
    } else if (data.type === RequestEnum.LEAVE_CLASSROOM) {
      console.log(`\t\tLEAVE_CLASSROOM request made...`);
      const id: number = ClassroomLeaveQueue.addRequest({
        username: req.body.user,
        ...data.data,
      });
      data.response = await ClassroomLeaveQueue.getResult(id);
      res.json(data.response);
    } else if (data.type === RequestEnum.CREATE_COURSE) {
      console.log(`\t\tCREATE_COURSE request made...`);
      const id: number = CourseCreationQueue.addRequest(data.data);
      data.response = await CourseCreationQueue.getResult(id);
      res.json(data.response);
    } else if (data.type === RequestEnum.ADD_COURSE_DATA) {
      console.log(`\t\tADD_COURSE_DATA request made...`);
      const payload = await prepareNote55(
        data.data.courseID,
        data.data.codeCourse,
        data.data.shape,
        data.data.data,
        data.data.author,
        data.data.tags,
        data.data.uploads
      );
      CouchDB.use(`coursedb-${data.data.courseID}`)
        .insert(payload as Nano.MaybeDocument)
        .then((r) => {
          console.log(`\t\t\tCouchDB insert result: ${JSON.stringify(r)}`);
          res.json(r);
        })
        .catch((e) => {
          console.log(`\t\t\tCouchDB insert error: ${JSON.stringify(e)}`);
          res.json(e);
        });
    }
  } else {
    console.log(`\tREQUEST UNAUTHORIZED!`);
    res.status(401);
    res.statusMessage = 'Unauthorized';
    res.send();
  }
}


app.post('/', (req, res) => {
  postHandler(req, res);
});

app.get('/version', (req, res) => {
  res.send(ENV.VERSION);
});

app.get('/', (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

init();

async function init() {
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
      console.log(`Error: ${e}`);
    }
  } catch (e) {
    console.log(`Error: ${JSON.stringify(e)}`);
  }
}

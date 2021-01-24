import Nano = require('nano');
import * as express from 'express';
import { ServerRequest, ServerRequestType as RequestEnum } from '../../vue/src/server/types';
import PostProcess from './attachment-preprocessing';
import {
  ClassroomCreationQueue,
  ClassroomJoinQueue,
  ClassroomLeaveQueue,
} from './client-requests/classroom-requests';
import CouchDB from './couchdb';
import { requestIsAuthenticated } from './couchdb/authentication';
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import fileSystem = require('fs');
import {
  CourseCreationQueue,
  initCourseDBDesignDocInsert,
} from './client-requests/course-requests';

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

export async function useOrCreateDB(dbName: string): Promise<Nano.DocumentScope<{}>> {
  let ret = CouchDB.use(dbName);

  try {
    await ret.info();
    return ret;
  } catch (err) {
    await CouchDB.db.create(dbName);
    return CouchDB.use(dbName);
  }
}

export async function docCount(dbName: string): Promise<number> {
  const db = await useOrCreateDB(dbName);
  const info = await db.info();
  return info.doc_count;
}

export interface SecurityObject extends Nano.MaybeDocument {
  admins: {
    names: string[];
    roles: string[];
  };
  members: {
    names: string[];
    roles: string[];
  };
}

export interface VueClientRequest extends express.Request {
  body: ServerRequest;
}

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

app.get('/', (req, res) => {
  CouchDB.session()
    .then((s) => {
      if (s.ok) {
        res.send(`Couchdb session is active. (this message is from express...)`);
      } else {
        res.send(`Couchdb session is ... not ok?`);
      }
    })
    .catch((e) => {
      res.send(`Problems in the couch session! ${JSON.stringify(e)}`);
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

init();

async function init() {
  try {
    // start the change-listner that does post-prodessing on user
    // media uploads
    PostProcess();

    initCourseDBDesignDocInsert();

    useOrCreateDB('classdb-lookup');
    try {
      (await useOrCreateDB('coursedb')).insert(
        {
          validate_doc_update: classroomDbDesignDoc,
        } as any,
        '_design/_auth'
      );
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  } catch (e) {
    console.log(`Error: ${JSON.stringify(e)}`);
  }
}

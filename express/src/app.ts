import Nano = require('nano');
import * as express from 'express';
import { ServerRequest, ServerRequestType as RequestEnum } from '../../vue/src/server/types';
import PostProcess from './attachment-preprocessing';
import { createClassroom } from './client-requests/classroom-requests';
import CouchDB from './couchdb';
import { requestIsAuthenticated } from './couchdb/authentication';
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import fileSystem = require('fs');

const port = 3000;
export const classroomDbDesignDoc = fileSystem.readFileSync('./assets/classroomDesignDoc.js', 'utf-8');
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true
}));

init();

async function init() {
    // start the change-listner that does post-prodessing on user
    // media uploads
    PostProcess();

    useOrCreateDB('classdb-lookup');
    (await useOrCreateDB('coursedb')).insert({
        validate_doc_update: classroomDbDesignDoc
    } as any, '_design/_auth');
}

export async function useOrCreateDB(dbName: string): Promise<Nano.DocumentScope<{}>> {

    let ret = CouchDB.use(dbName);

    try {
        await ret.info();
        return ret;
    }
    catch (err) {
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
        names: string[],
        roles: string[]
    },
    members: {
        names: string[],
        roles: string[]
    }
}

export interface VueClientRequest extends express.Request {
    body: ServerRequest
}

async function postHandler(req: VueClientRequest, res: express.Response) {
    console.log(`Request made...`);
    const auth = await requestIsAuthenticated(req);
    if (auth) {
        console.log(`\tAuthenticated request made...`);
        const data = req.body;

        if (data.type === RequestEnum.CREATE_CLASSROOM) {
            console.log(`\t\tCREATE_CLASSROOM request made...`);
            data.response = await createClassroom(data.className, data.user);
            res.json(data.response);
        } else if (data.type === RequestEnum.DELETE_CLASSROOM) {

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

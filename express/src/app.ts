import Nano = require('nano');
import * as express from 'express';
import {
    ServerRequest,
    ServerRequestType as RequestEnum
} from '../../vue/src/server/types';
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import fileSystem = require('fs');
import CouchDB, { couchURL } from './couchdb';
import PostProcess from './attachment-preprocessing';
import { createClassroom } from './client-requests/classroom-requests';

// normalize('blue-s.mp3');

const port = 3000
export const classroomDbDesignDoc = fileSystem.readFileSync('./assets/classroomDesignDoc.js', 'utf-8');
const app = express()

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

interface CouchSession {
    info: {
        authenticated: string;
        authentication_db: string;
        authentication_handlers: string[];
    };
    ok: boolean;
    userCtx: {
        name: string;
        roles: string[];
    };
}

async function requestIsAdminAuthenticated(req: express.Request) {

    const username = (req.body as ServerRequest).user;
    console.log(`Request from ${username}...`);
    const authCookie: string = req.cookies.AuthSession ? req.cookies.AuthSession : 'null';

    if (authCookie === 'null') {
        return false;
    } else {

        return await Nano({
            cookie: "AuthSession=" + authCookie,
            url: 'http://' + couchURL
        }).session().then((s: CouchSession) => {
            console.log(`AuthUser: ${JSON.stringify(s)}`);
            const isAdmin = s.userCtx.roles.indexOf('_admin') !== -1;
            const isLoggedInUser = s.userCtx.name === username;

            return isAdmin && isLoggedInUser;
        }).catch((err) => {
            return false;
        });
    }
}

async function requestIsAuthenticated(req: express.Request) {

    const username = (req.body as ServerRequest).user;
    console.log(`Request from ${username}...`);
    const authCookie: string = req.cookies.AuthSession ? req.cookies.AuthSession : 'null';

    if (authCookie === 'null') {
        return false;
    } else {

        return await Nano({
            cookie: "AuthSession=" + authCookie,
            url: 'https://' + couchURL
        }).session().then((s: CouchSession) => {
            console.log(`AuthUser: ${JSON.stringify(s)}`);
            return s.userCtx.name === username;
        }).catch((err) => {
            return false;
        });
    }
}

async function postHandler(req: express.Request, res: express.Response) {
    console.log(`Request made...`);
    const auth = await requestIsAuthenticated(req);
    if (auth) {
        console.log(`\tAuthenticated request made...`);
        const data = req.body as ServerRequest;

        if (data.type === RequestEnum.CREATE_CLASSROOM) {
            console.log(`\t\tCREATE_CLASSROOM request made...`);
            data.response = await createClassroom(data.className, data.user);
            res.json(data.response);
        } else if (data.type === RequestEnum.DELETE_CLASSROOM) {

        }
    } else {
        res.status(401);
        res.statusMessage = 'Unauthorized';
        res.send();
    }
}

app.post('/', (req, res) => {
    postHandler(req, res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

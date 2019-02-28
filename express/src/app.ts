import Nano = require('nano');
import * as express from 'express';
import hashids from 'hashids';
import {
    ServerRequest,
    ServerRequestType as RequestEnum
} from '../../vue/src/server/types';
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import fileSystem = require('fs');
import CouchDB, { couchURL } from './couchdb';

const port = 3000
const classroomDbDesignDoc = fileSystem.readFileSync('./assets/classroomDesignDoc.js', 'utf-8');
const app = express()

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true
}));

useOrCreateDB('classdb-lookup');

async function useOrCreateDB(dbName: string): Promise<Nano.DocumentScope<{}>> {

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

async function docCount(dbName: string): Promise<number> {
    const db = await useOrCreateDB(dbName);
    const info = await db.info();
    return info.doc_count;
}

interface SecurityObject extends Nano.MaybeDocument {
    admins: {
        names: string[],
        roles: string[]
    },
    members: {
        names: string[],
        roles: string[]
    }
}

async function createClassroom(name: string, teacher: string) {
    const num = await docCount('classdb-lookup') + 1; //
    const uuid = (await CouchDB.uuids(1)).uuids[0];

    const hasher = new hashids('', 6, 'abcdefghijklmnopqrstuvwxyz123456789');
    const joinCode: string = hasher.encode(num);

    const studentDbName: string = `classdb-student-${uuid}`;
    const teacherDbName: string = `classdb-teacher-${uuid}`;

    const security: SecurityObject = {
        // _id: '_security',
        admins: {
            names: [teacher],
            roles: []
        },
        members: {
            names: [],
            roles: []
        }
    }

    let [
        studentdb,
        teacherdb,
        lookup
    ] = await Promise.all([
        useOrCreateDB(studentDbName),
        useOrCreateDB(teacherDbName),
        useOrCreateDB('classdb-lookup')
    ])

    await Promise.all([
        studentdb.insert({
            validate_doc_update: classroomDbDesignDoc,
        } as any, '_design/_auth'),
        studentdb.insert(security, '_security'),
        teacherdb.insert(security, '_security'),
        lookup.insert({
            num,
            uuid
        } as any, joinCode)
    ]);

    return {
        joinCode
    };
}

interface couchSession {
    info: {};
    ok: boolean;
    userCtx: {
        name: string;
        roles: string[];
    };
}

async function requestIsAuthenticated(req: express.Request) {

    const username = (req.body as ServerRequest).user;
    const authCookie: string = req.cookies.AuthSession ? req.cookies.AuthSession : 'null';

    if (authCookie === 'null') {
        return false;
    } else {

        return await Nano({
            cookie: "AuthSession=" + authCookie,
            url: 'http://' + couchURL
        }).session().then((s) => {
            console.log(`AuthUser: ${JSON.stringify(s)}`);
            return s.userCtx.name === username;
        }).catch((err) => {
            return false;
        });
    }
}

async function postHandler(req: express.Request, res: express.Response) {
    if (await requestIsAuthenticated(req)) {
        const data = req.body as ServerRequest;

        if (data.type === RequestEnum.CREATE_CLASSROOM) {
            res.json(
                await createClassroom(data.className, data.user)
            );
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

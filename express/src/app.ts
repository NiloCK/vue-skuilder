import Nano = require('nano');
import * as express from 'express';
import * as http from 'http';
import * as pouch from 'pouchdb';
import dotenv = require('dotenv');
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import {
    ServerRequest,
    ServerRequestType as RequestEnum,
} from '../../vue/src/server/types';

const port = 3000
const classroomDbDesignDoc = fileSystem.readFileSync('./assets/classroomDesignDoc.js', 'utf-8');
const app = express()

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true
}));

dotenv.config({
    path: './.env.development'
});

const couchURL = process.env.VUE_APP_COUCHDB;
const debug = process.env.VUE_APP_DEBUG;

dotenv.config({
    path: './.env.development.local'
});

const admin = {
    username: process.env.VUE_APP_COUCH_ADMIN,
    password: process.env.VUE_APP_COUCH_PASSWORD
}
const credentialCouchURL =
    `http://${admin.username}:${admin.password}@${couchURL}`;

console.log(
    `url: ${couchURL}
    credentials:
    \tusername: ${admin.username}
    \tpassword: ${admin.password}
    credUrl: ${credentialCouchURL}
    `);

let Couch = Nano(credentialCouchURL);

let count = 5;

function createClassroom(name: string, teacher: string) {
    const studentDbName: string = `classdb-student-${name}`;
    const teacherDbName: string = `classdb-teacher-${name}`;

    Couch.db.create(studentDbName).then((resp) => {
        if (resp.ok) {
            return Couch.db.create(teacherDbName);
        }
    }).then((resp) => {
        if (resp.ok) {
            let stuDb = Couch.use(studentDbName);
            stuDb.get('_security').then((secDoc) => {
                (secDoc as any).admins = [teacher];
                (secDoc as any).members = [];
                stuDb.insert(secDoc);
            });
        }
    });
}
interface couchSession {
    info: {};
    ok: boolean;
    userCtx: {
        name: string;
        roles: string[];
    };
}

async function userIsAuthenticated(authCookie: string, username: string) {

    let ret = await Nano({
        cookie: "AuthSession=" + authCookie,
        url: 'http://' + couchURL
    }).session().then((s) => {
        console.log(`AuthUser: ${JSON.stringify(s)}`);
        return s.userCtx.name === username;
    }).catch((err) => {
        return false;
    });

    return ret;
}

app.post('/', (req, res) => {

    const data = req.body as ServerRequest;

    if (req.cookies.AuthSession) {

        console.log('Authcookie present: ' + req.cookies.AuthSession);
        userIsAuthenticated(req.cookies.AuthSession, data.user).then((auth) => {
            if (auth) {
                res.json({
                    loggedIn: true
                });
                res.send();
            }
        });
    }

    if (data.type === RequestEnum.CREATE_CLASSROOM) {
        console.log("Creating a classroom.........");
        // createClassroom('testclass' + Math.random().toPrecision(10), 'Colin');
    } else {
        console.log("Doing something other than creating a classroom.........");
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

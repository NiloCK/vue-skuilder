import Nano = require('nano');
import * as express from 'express';
import * as http from 'http';
import * as pouch from 'pouchdb';
import dotenv = require('dotenv');
import bodyParser = require('body-parser');
import cors = require('cors');

const port = 3000
const app = express()

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

app.get('/', (req, res) => {

    console.log(new Date() + '\t' + JSON.stringify(req.body));

    console.log("Creating a classroom.........");
    // createClassroom('testclass' + Math.random().toPrecision(10), 'Colin');
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.send();
});

function checkLoginStatus(req: Request): boolean {

    return false;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

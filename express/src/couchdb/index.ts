import dotenv = require('dotenv');
import Nano = require('nano');

dotenv.config({
    path: './.env.development'
});

export const couchURL = process.env.VUE_APP_COUCHDB;
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

let CouchDB = Nano(credentialCouchURL);

export default CouchDB;
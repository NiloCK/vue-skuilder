import dotenv = require('dotenv');
import Nano = require('nano');

dotenv.config({
  path: '../.env.development.local',
});

const url = process.env.VUE_APP_COUCHDB_SERVER;
const protocol: string = process.env.VUE_APP_COUCHDB_PROTOCOL;

const debug = process.env.VUE_APP_DEBUG;

const admin = {
  username: process.env.VUE_APP_COUCHDB_ADMIN,
  password: process.env.VUE_APP_COUCHDB_PASSWORD,
};
const credentialCouchURL = `${protocol}://${admin.username}:${admin.password}@${url}`;

console.log(
  `CouchDB url: ${url}
    protocol: ${protocol}
    credentials: 
    \tusername: ${admin.username}
    \tpassword: *****
    credUrl: ${protocol}://${admin.username}:*****@${url}
    `
);

const CouchDB = Nano(credentialCouchURL);

export const COUCH_URL_WITH_PROTOCOL = protocol + '://' + process.env.VUE_APP_COUCHDB_SERVER;

export default CouchDB;

import dotenv = require('dotenv');
import Nano = require('nano');

dotenv.config({
  path: '.env.development.local',
});

const url = process.env.COUCHDB_SERVER;
const protocol: string = process.env.COUCHDB_PROTOCOL;

const debug = process.env.DEBUG;

const admin = {
  username: process.env.COUCHDB_ADMIN,
  password: process.env.COUCHDB_PASSWORD,
};
const credentialCouchURL = `${'http'}://admin:rb0=gj9f@localhost:5984`;

console.log('WORKING DIRECTORY: ' + process.cwd());
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

export const COUCH_URL_WITH_PROTOCOL = protocol + '://' + process.env.COUCHDB_SERVER;

export default CouchDB;

import dotenv = require('dotenv');
import Nano = require('nano');
import process = require('process');

dotenv.config({
  path: process.argv && process.argv.length == 3 ? process.argv[2] : '.env.development.local',
});

const url = process.env.COUCHDB_SERVER;
const protocol: string = process.env.COUCHDB_PROTOCOL;

const debug = process.env.DEBUG;

const admin = {
  username: process.env.COUCHDB_ADMIN,
  password: process.env.COUCHDB_PASSWORD,
};
const credentialCouchURL = `${protocol}://${admin.username}:${admin.password}@${url}`;

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

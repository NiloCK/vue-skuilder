import dotenv from 'dotenv';
import process from 'process';
import fs from 'fs';

dotenv.config({
  path:
    process.argv && process.argv.length == 3
      ? process.argv[2]
      : '.env.development',
});

type Env = {
  COUCHDB_SERVER: string;
  COUCHDB_PROTOCOL: string;
  COUCHDB_ADMIN: string;
  COUCHDB_PASSWORD: string;
  VERSION: string;
};

function getVar(name: string): string {
  if (process.env[name]) {
    return process.env[name];
  } else {
    throw new Error(`${name} not defined in environment`);
  }
}

const env: Env = {
  COUCHDB_SERVER: getVar('COUCHDB_SERVER'),
  COUCHDB_PROTOCOL: getVar('COUCHDB_PROTOCOL'),
  COUCHDB_ADMIN: getVar('COUCHDB_ADMIN'),
  COUCHDB_PASSWORD: getVar('COUCHDB_PASSWORD'),
  VERSION: getVar('VERSION'),
};

export default env;

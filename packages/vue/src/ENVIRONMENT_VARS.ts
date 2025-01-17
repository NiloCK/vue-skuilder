interface Environment {
  /**
   * URL to the remote couchDB instance that the app connects to.
   *
   * In development, this can be set as a simple string so that an in-browser
   * pouch-db instance is used instead.
   */
  COUCHDB_SERVER_URL: string;
  COUCHDB_SERVER_PROTOCOL: ProtocolString;
  /**
   * URL to the Express webserver that serves requests for
   * database creation / reading / writing that are finer-
   * grained than CouchDB's auth system handles automatically
   */
  EXPRESS_SERVER_URL: string;
  EXPRESS_SERVER_PROTOCOL: ProtocolString;

  /**
   * A global flag to enable debug messaging mode for different libraries
   * in the project.
   */
  DEBUG: boolean;

  /**
   * A flag to enable the use of mock data instead of real data.
   */
  MOCK: boolean;
}

type ProtocolString = 'http' | 'https';

const ENV: Environment = {
  COUCHDB_SERVER_URL: '',
  COUCHDB_SERVER_PROTOCOL: 'http',
  EXPRESS_SERVER_URL: '',
  EXPRESS_SERVER_PROTOCOL: 'http',
  DEBUG: false,
  MOCK: false,
};

ENV.COUCHDB_SERVER_URL = import.meta.env.VITE_COUCHDB_SERVER!;
ENV.COUCHDB_SERVER_PROTOCOL = import.meta.env.VITE_COUCHDB_PROTOCOL! as ProtocolString;

ENV.EXPRESS_SERVER_URL = import.meta.env.VITE_EXPRESS_SERVER!;
ENV.EXPRESS_SERVER_PROTOCOL = import.meta.env.VITE_EXPRESS_PROTOCOL! as ProtocolString;

if (import.meta.env.VITE_DEBUG !== undefined) {
  ENV.DEBUG = import.meta.env.VITE_DEBUG === 'true';
}

if (import.meta.env.VITE_MOCK !== undefined) {
  ENV.MOCK = import.meta.env.VITE_MOCK === 'true';
}

if (ENV.DEBUG) {
  console.log(`ENV init:`);
  for (const s in ENV) {
    console.log(`${s}:\n  ${(ENV as any)[s]}`);
  }
}

export default ENV;

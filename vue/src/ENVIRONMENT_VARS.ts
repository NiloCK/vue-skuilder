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
}

type ProtocolString = 'http' | 'https';

const ENV: Environment = {
    COUCHDB_SERVER_URL: '',
    COUCHDB_SERVER_PROTOCOL: 'http',
    EXPRESS_SERVER_URL: '',
    EXPRESS_SERVER_PROTOCOL: 'http',
    DEBUG: false
};

ENV.COUCHDB_SERVER_URL = process.env.VUE_APP_COUCHDB_SERVER!;
ENV.COUCHDB_SERVER_PROTOCOL = process.env.VUE_APP_COUCHDB_PROTOCOL! as ProtocolString;

ENV.EXPRESS_SERVER_URL = process.env.VUE_APP_EXPRESS_SERVER!;
ENV.EXPRESS_SERVER_PROTOCOL = process.env.VUE_APP_EXPRESS_PROTOCOL! as ProtocolString;

if (process.env.VUE_APP_DEBUG !== undefined) {
    ENV.DEBUG = process.env.VUE_APP_DEBUG === 'true';
}

if (ENV.DEBUG) {
    console.log(`ENV init:`);
    for (let s in ENV) {
        console.log(`${s}:\n  ${(ENV as any)[s]}`)
    }
}

export default ENV;

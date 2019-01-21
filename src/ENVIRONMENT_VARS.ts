interface Environment {
    COUCHDB_SERVER_URL: string
    DEBUG: boolean
}

let env: Environment = {
    COUCHDB_SERVER_URL: '',
    DEBUG: false
};

env.COUCHDB_SERVER_URL = process.env.VUE_APP_COUCHDB_SERVER!;

if (process.env.VUE_APP_DEBUG !== undefined) {
    env.DEBUG = process.env.VUE_APP_DEBUG === 'true';
}

export default env;

/**
 * URL to the remote couchDB instance that the app connects to.
 *
 * In development, this is set as a simple string so that an in-browser
 * pouch-db instance is used instead.
 */
export const remote_couch_url: string =
    // 'devRemote';
    process.env.VUE_APP_COUCHDB_SERVER!;
/**
 * A global flag to enable debug messaging mode for different libraries
 * in the project.
 */
export const debug_mode: boolean =
    true;
// false;

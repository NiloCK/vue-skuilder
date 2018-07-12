/**
 * URL to the remote couchDB instance that the app connects to.
 *
 * In development, this is set as a simple string so that an in-browser
 * pouch-db instance is used instead.
 */
export const remote_db_url: string = 'http://localhost:5984/skuilder/';
/* running an in-browser 'remote' db is currently broken. See issue #18 for comment */
// export const remote_db_url: string = 'devRemote';

/**
 * A global flag to enable debug messaging mode for different libraries
 * in the project.
 */
export const debug_mode: boolean = true;

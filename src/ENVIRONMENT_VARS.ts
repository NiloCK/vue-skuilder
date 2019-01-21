interface Environment {
    COUCHDB_SERVER_URL: string;
    DEBUG: boolean;
}

const ENV: Environment = {
    COUCHDB_SERVER_URL: '',
    DEBUG: false
};

ENV.COUCHDB_SERVER_URL = process.env.VUE_APP_COUCHDB_SERVER!;

if (process.env.VUE_APP_DEBUG !== undefined) {
    ENV.DEBUG = process.env.VUE_APP_DEBUG === 'true';
}

export default ENV;

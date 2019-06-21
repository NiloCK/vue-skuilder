import Nano = require('nano');
import { COUCH_URL_WITH_PROTOCOL } from '.';
import { VueClientRequest } from '../app';

interface CouchSession {
    info: {
        authenticated: string;
        authentication_db: string;
        authentication_handlers: string[];
    };
    ok: boolean;
    userCtx: {
        name: string;
        roles: string[];
    };
}

export async function requestIsAdminAuthenticated(req: VueClientRequest) {
    const username = req.body.user;
    console.log(`Request from ${username}...`);
    const authCookie: string = req.cookies.AuthSession ? req.cookies.AuthSession : 'null';
    if (authCookie === 'null') {
        return false;
    }
    else {
        return await Nano({
            cookie: "AuthSession=" + authCookie,
            url: COUCH_URL_WITH_PROTOCOL
        }).session().then((s: CouchSession) => {
            console.log(`AuthUser: ${JSON.stringify(s)}`);
            const isAdmin = s.userCtx.roles.indexOf('_admin') !== -1;
            const isLoggedInUser = s.userCtx.name === username;
            return isAdmin && isLoggedInUser;
        }).catch((err) => {
            return false;
        });
    }
}

export async function requestIsAuthenticated(req: VueClientRequest) {
    const username = req.body.user;
    console.log(`Request from ${username}...`);
    const authCookie: string = req.cookies.AuthSession ? req.cookies.AuthSession : 'null';
    if (authCookie === 'null') {
        return false;
    }
    else {
        return await Nano({
            cookie: "AuthSession=" + authCookie,
            url: COUCH_URL_WITH_PROTOCOL
        }).session().then((s: CouchSession) => {
            console.log(`AuthUser: ${JSON.stringify(s)}`);
            return s.userCtx.name === username;
        }).catch((err) => {
            return false;
        });
    }
}

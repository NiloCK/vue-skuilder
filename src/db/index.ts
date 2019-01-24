import { Displayable } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import {
    CardData,
    CardRecord,
    DataShapeData,
    DisplayableData,
    DocType,
    QuestionData,
    SkuilderCourseData,
    CardHistory
} from '@/db/types';
import { FieldType } from '@/enums/FieldType';
import ENV from '@/ENVIRONMENT_VARS';
import { GuestUsername } from '@/store';
import moment from 'moment';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import process from 'process';
import { log } from 'util';
import { ScheduledCard } from './User';

(window as any).process = process; // required as a fix for pouchdb - see #18

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

if (ENV.DEBUG) {
    // pouch.debug.enable('pouchdb:find');
}

const expiryDocID: string = 'GuestAccountExpirationDate';
const dbUUID = 'dbUUID';

const remote: PouchDB.Database = new pouch(
    ENV.COUCHDB_SERVER_URL + 'skuilder',
    {
        skip_setup: true
    }
);
const localUserDB: PouchDB.Database = new pouch('skuilder');

function hexEncode(str: string): string {
    let hex: string;
    let returnStr: string = '';

    for (let i = 0; i < str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        returnStr += ('000' + hex).slice(3);
    }

    return returnStr;
}

export function getUserDB(username: string): PouchDB.Database {
    let guestAccount: boolean = false;
    if (username === GuestUsername) {
        username = accomodateGuest();
        guestAccount = true;
    }

    const hexName = hexEncode(username);
    const dbName = `userdb-${hexName}`;
    log(`Fetching user database: ${dbName} (${username})`);

    // odd construction here the result of a bug in the
    // interaction between pouch, pouch-auth.
    // see: https://github.com/pouchdb-community/pouchdb-authentication/issues/239
    const ret = new pouch(ENV.COUCHDB_SERVER_URL + dbName, {
        fetch(url: any, opts: any) {
            opts.credentials = 'include';
            return (pouch as any).fetch(url, opts);
        }
    } as PouchDB.Configuration.RemoteDatabaseConfiguration);

    if (guestAccount) {
        updateGuestAccountExpirationDate(ret);
    }

    pouch.replicate(ret, localUserDB);

    return ret;
}

/**
 * Checks the remote couchdb to see if a given username is available
 * @param username The username to be checked
 */
export async function usernameIsAvailable(username: string): Promise<boolean> {
    log(`Checking availability of ${username}`);
    const req = new XMLHttpRequest();
    const url = ENV.COUCHDB_SERVER_URL + 'userdb-' + hexEncode(username);
    req.open('HEAD', url, false);
    req.send();
    return req.status === 404;
}

function updateGuestAccountExpirationDate(guestDB: PouchDB.Database<{}>) {
    const currentTime = moment();
    const expirationDate: string = currentTime.add(2, 'months').toISOString();

    guestDB.get(expiryDocID).then((doc) => {
        guestDB.put({
            _id: expiryDocID,
            _rev: doc._rev,
            date: expirationDate
        });
    }).catch((err: PouchDB.Core.Error) => {
        guestDB.put({
            _id: expiryDocID,
            date: expirationDate
        });
    });
}


function accomodateGuest() {
    let username: string;

    if (localStorage.getItem(dbUUID) !== null) {
        username = GuestUsername + localStorage.getItem(dbUUID);
        remoteDBLogin(username, localStorage.getItem(dbUUID)!);
    } else {
        const uuid = generateUUID();
        localStorage.setItem(dbUUID, uuid);
        username = GuestUsername + uuid;
        remoteDBSignup(username, uuid);
        remoteDBLogin(username, uuid);
    }

    return username;

    // pilfered from https://stackoverflow.com/a/8809472/1252649
    function generateUUID() {
        let d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); // use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line:no-bitwise
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            // tslint:disable-next-line:no-bitwise
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}

export function remoteDBLogin(username: string, password: string) {
    return remote.logIn(username, password);
}

function CreateClassroom(className: string) {
    return new pouch(ENV.COUCHDB_SERVER_URL + 'className');
}


export function remoteDBSignup(
    username: string,
    password: string,
    options?: PouchDB.Authentication.PutUserOptions) {

    const newDBRequest = remote.signUp(username, password);

    newDBRequest.then((resp) => {
        if (resp.ok) {
            localUserDB.get(expiryDocID).then((doc) => {
                return localUserDB.remove(doc._id, doc._rev);
            }).then(() => {
                localUserDB.replicate.to(getUserDB(username));
            }).catch(() => {
                localUserDB.replicate.to(getUserDB(username));
            });
        }
    });

    return newDBRequest;

}

export function getDoc
    <T extends SkuilderCourseData>(id: PouchDB.Core.DocumentId, options: PouchDB.Core.GetOptions = {}): Promise<T> {
    return remote.get<T>(id, options);
}

export async function putQuestionType(course: string, question: typeof Displayable) {
    const questionID = NameSpacer.getQuestionString({
        course,
        questionType: question.name
    });

    const viewList = question.views.map((view) => view.name);

    const dataShapeList = question.dataShapes.map((shape) =>
        NameSpacer.getDataShapeString({
            course,
            dataShape: shape.name
        })
    );

    try {
        await dataShapeList.forEach((id) => {
            getDoc<DataShapeData>(id).
                then((doc) => {
                    doc.questionTypes.push(questionID);
                    remote.put(doc);
                })
                .catch(() => {
                    throw new Error(
                        `${id} is not registered in the database.
                    Register dependant dataShapes before registering a question Type.`
                    );
                });
        });
    } catch (err) {
        throw err;
    }

    return remote.put<QuestionData>({
        _id: questionID,
        course,
        docType: DocType.QUESTIONTYPE,
        viewList,
        dataShapeList
    });
}

export function getQuestions(course: string) {
    return remote.find({
        selector: {
            docType: DocType.QUESTIONTYPE,
            course
        }
    });
}

export function putDataShape(course: string, dataShape: DataShape) {

    const dataShapeId: string = NameSpacer.getDataShapeString({
        course,
        dataShape: dataShape.name
    });

    return remote.put<DataShapeData>({
        course,
        docType: DocType.DATASHAPE,
        _id: dataShapeId,
        questionTypes: []
    });
}

export function putQuestionView(
    course: string,
    questionName: string,
    viewName: string
) {
    const questionID = NameSpacer.getQuestionString({
        course,
        questionType: questionName
    });

    getDoc<QuestionData>(questionID).then((question) => {
        if (question.viewList.indexOf(viewName) === -1) {
            question.viewList.push(viewName);
            remote.put(question);
        } else {
            throw new Error(
                `putQuestionView failed: ${course}.${questionName} already contains a view named ${viewName}`
            );
        }
    });
}

export function doesUserExist(name: string) {
    return remote.getUser(name).then((user) => {
        log(`user: ${user._id}`);
        return true;
    }).catch((err) => {
        log(`User error: ${err}`);
        return false;
    });
}

export function addNote(course: string, shape: DataShape, data: any) {
    // todo: make less crappy - test for duplicate insertions - #15

    const dataShapeId = NameSpacer.getDataShapeString({
        course,
        dataShape: shape.name
    });

    const attachmentFields = shape.fields.filter((field) => {
        return field.type === FieldType.IMAGE;
    });
    const attachments: { [index: string]: PouchDB.Core.FullAttachment } = {};
    const payload: DisplayableData = {
        course,
        data: [],
        docType: DocType.DISPLAYABLE_DATA,
        id_datashape: dataShapeId
    };

    if (attachmentFields.length !== 0) {
        attachmentFields.forEach((attField) => {
            attachments[attField.name] = data[attField.name];
        });
        payload._attachments = attachments;
    }

    shape.fields.filter((field) => {
        return field.type !== FieldType.IMAGE;
    }).forEach((field) => {
        payload.data.push({
            name: field.name,
            data: data[field.name]
        });
    });

    return remote.post<DisplayableData>(payload).then((result) => {
        if (result.ok) {
            createCards(course, dataShapeId, result.id);
        }
        return result;
    });
}

function getImplementingQuestions(dataShape: PouchDB.Core.DocumentId) {
    return getDoc<DataShapeData>(dataShape).then((shapeResult) => {
        return shapeResult.questionTypes;
    }).then((questions) => {
        return questions.map((question) => {
            return getDoc<QuestionData>(question);
        });
    });
}

function createCards(course: string, dataShapeId: PouchDB.Core.DocumentId, noteId: PouchDB.Core.DocumentId) {
    getImplementingQuestions(dataShapeId)
        .then((qPromises) => {
            qPromises.forEach((questionPromise) => {
                questionPromise.then((question) => {
                    const qName = NameSpacer.getQuestionDescriptor(
                        question._id
                    ).questionType;

                    question.viewList.forEach((view) => {
                        addCard(
                            course,
                            [noteId],
                            NameSpacer.getViewString({
                                course,
                                questionType: qName,
                                view
                            })
                        );
                    });
                });
            });
        });
}

/**
 * Returns a promise with doc stubs for all notes of the given dataShape
 * @param course The course name.
 * @param shape The datashape of the notes to be returned.
 */
export function getNotes(course: string, shape: DataShape) {
    return remote.find({
        selector: {
            course,
            docType: DocType.DISPLAYABLE_DATA,
            id_datashape: shape.name
        }
    });
}

/**
 * Returns a list of the registered dataShapes for the specified course,
 * or a list of all registered dataShapes if no course name is provided
 * @param course The name of the course to search
 */
export function getDataShapes(course?: string) {
    if (course) {
        return remote.find({
            selector: {
                course,
                docType: DocType.DATASHAPE
            }
        });
    } else {
        return remote.find({
            selector: {
                docType: DocType.DATASHAPE
            }
        });
    }
}

export function getCards(course?: string) {
    if (course) {
        return remote.find({
            selector: {
                course,
                docType: DocType.CARD
            }
        });
    } else {
        return remote.find({
            selector: {
                docType: DocType.CARD
            }
        });
    }
}

/**
 * Adds a card to the DB. This function is called
 * as a side effect of adding either a View or
 * DisplayableData item.
 * @param course The name of the course that the card belongs to
 * @param id_displayable_data C/PouchDB ID of the data used to hydrate the view
 * @param id_view C/PouchDB ID of the view used to display the card
 */
function addCard(
    course: string,
    id_displayable_data: PouchDB.Core.DocumentId[],
    id_view: PouchDB.Core.DocumentId) {
    return remote.post<CardData>({
        course,
        id_displayable_data,
        id_view,
        docType: DocType.CARD
    });
}

export async function putCardRecord<T extends CardRecord>(record: T, user: string) {
    const userDB = getUserDB(user);
    const cardHistoryID = 'cardH-' + record.cardID;

    try {
        const cardHistory = await userDB.get<CardHistory<T>>(cardHistoryID);
        cardHistory.records.push(record);
        userDB.put(cardHistory);
        momentifyCardHistory<T>(cardHistory);
        return cardHistory;
    }
    catch (reason) {
        if (reason.status === 404) {
            const initCardHistory: CardHistory<T> = {
                _id: cardHistoryID,
                cardID: record.cardID,
                records: [record]
            };
            momentifyCardHistory<T>(initCardHistory);
            userDB.put<CardHistory<T>>(initCardHistory);
            return initCardHistory;
        }
        else {
            throw (`putCardRecord failed because of:\n            name:${reason.name}\n            error: ${reason.error}\n            id: ${reason.id}\n            message: ${reason.message}`);
        }
    }
}

function momentifyCardHistory<T extends CardRecord>(cardHistory: CardHistory<T>) {
    cardHistory.records = cardHistory.records.map<T>((record) => {
        const ret: T = {
            ...record
        };
        ret.timeStamp = moment(record.timeStamp);
        return ret;
    });
}

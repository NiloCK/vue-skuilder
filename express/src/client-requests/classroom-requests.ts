import hashids from 'hashids';
import { ClassroomConfig, CreateClassroom, JoinClassroom, LeaveClassroom } from '../../../vue/src/server/types';
import { Status } from '../../../vue/src/enums/Status';
import { classroomDbDesignDoc, docCount, SecurityObject, useOrCreateDB } from '../app';
import CouchDB from '../couchdb';
import AsyncProcessQueue, { Result } from '../utils/processQueue';

export const CLASSROOM_DB_LOOKUP = 'classdb-lookup';
const CLASSROOM_CONFIG = 'ClassroomConfig';

interface lookupData {
    num: number;
    uuid: string;
}

async function deleteClassroom(classroom_id: string) {
}

async function getClassID(joinCode: string) {
    try {
        const doc = await (await useOrCreateDB(CLASSROOM_DB_LOOKUP)).get(joinCode);
        return (doc as any as lookupData).uuid;
    } catch (e) {
        return '';
    }
}

async function getClassroomConfig(id: string): Promise<ClassroomConfig> {
    return (await useOrCreateDB(getClassDBNames(id).studentDB)).
        get(CLASSROOM_CONFIG) as unknown as ClassroomConfig;
}
async function writeClassroomConfig(config: ClassroomConfig, classID: string) {
    console.log(`Writing config for class: ${classID}`);
    const dbNames = getClassDBNames(classID);
    let studentDB = await useOrCreateDB(dbNames.studentDB);
    let teacherDB = await useOrCreateDB(dbNames.teacherDB);

    return Promise.all([
        studentDB.get(CLASSROOM_CONFIG).then(doc => {
            studentDB.insert({
                _id: CLASSROOM_CONFIG,
                _rev: doc._rev,
                ...config
            });
        }).catch(err => {
            studentDB.insert({
                _id: CLASSROOM_CONFIG,
                ...config
            });
        }),
        teacherDB.get(CLASSROOM_CONFIG).then(doc => {
            teacherDB.insert({
                _id: CLASSROOM_CONFIG,
                _rev: doc._rev,
                ...config
            });
        }).catch(err => {
            teacherDB.insert({
                _id: CLASSROOM_CONFIG,
                ...config
            });
        })
    ]);
}

function getClassDBNames(classId: string): {
    studentDB: string,
    teacherDB: string
} {
    return {
        studentDB: `classdb-student-${classId}`,
        teacherDB: `classdb-teacher-${classId}`
    }
}

async function createClassroom(config: ClassroomConfig) {
    console.log(`CreateClass Request:
    ${JSON.stringify(config)}`);

    const num = await docCount(CLASSROOM_DB_LOOKUP) + 1; //
    const uuid = (await CouchDB.uuids(1)).uuids[0];
    const hasher = new hashids('', 6, 'abcdefghijklmnopqrstuvwxyz123456789');
    const studentDbName: string = `classdb-student-${uuid}`;
    const teacherDbName: string = `classdb-teacher-${uuid}`;
    config.joinCode = hasher.encode(num);

    const security: SecurityObject = {
        // _id: '_security',
        admins: {
            names: [],
            roles: []
        },
        members: {
            names: config.teachers,
            roles: []
        }
    };

    let [studentdb, teacherdb, lookup] = await Promise.all([
        useOrCreateDB(studentDbName),
        useOrCreateDB(teacherDbName),
        useOrCreateDB('classdb-lookup')
    ]);
    await Promise.all([
        studentdb.insert({
            validate_doc_update: classroomDbDesignDoc,
        } as any, '_design/_auth'),
        // studentdb.insert(security, '_security'),
        teacherdb.insert(security, '_security'),
        lookup.insert({
            num,
            uuid
        } as any, config.joinCode),
        writeClassroomConfig(config, uuid)
    ]);

    let res: Result = {
        ok: true,
        status: 'ok'
    }
    let ret = {
        joincode: config.joinCode,
        uuid: uuid,
        ...res
    };

    console.log(JSON.stringify(ret));

    return ret;
}

async function leaveClassroom(req: LeaveClassroom['data'] & { username: string }) {
    let cfg: ClassroomConfig = (await getClassroomConfig(req.classID));
    if (cfg) {
        let index = cfg.students.indexOf(req.username);
        if (index !== -1) {
            cfg.students.splice(index, 1);
        }

        await writeClassroomConfig(cfg, req.classID);

        return {
            status: Status.ok,
            ok: true
        }
    } else {
        return {
            status: Status.error,
            ok: false,
            errorText: 'Course with this ID not found.'
        }
    }

}

async function joinClassroom(req: JoinClassroom['data']) {
    const classID = await getClassID(req.joinCode);
    if (classID) {
        const classDBNames = getClassDBNames(classID);

        (await useOrCreateDB(classDBNames.studentDB)).get('ClassroomConfig')

        console.log(`joinClassroom running...
        \tRequest: ${JSON.stringify(req)}`);

        let cfg: ClassroomConfig = (await getClassroomConfig(classID))!;

        if (req.registerAs === 'student') {
            if (cfg.students.indexOf(req.user) === -1) {
                cfg.students.push(req.user);
            }
        }

        writeClassroomConfig(cfg, classID);

        let res: JoinClassroom['response'] = {
            ok: true,
            status: Status.ok,
            id_course: classID,
            course_name: cfg.name
        }
        return res;
    } else {
        return {
            ok: false,
            status: Status.error,
            id_course: '',
            course_name: '',
            errorText: 'No course found with this joincode!'
        }
    }
}

export const ClassroomLeaveQueue = new AsyncProcessQueue<
    LeaveClassroom['data'] & { username: string },
    LeaveClassroom['response']
>(leaveClassroom);

export const ClassroomJoinQueue = new AsyncProcessQueue<
    JoinClassroom['data'],
    JoinClassroom['response']
>(joinClassroom);

export const ClassroomCreationQueue = new AsyncProcessQueue<
    CreateClassroom['data'],
    CreateClassroom['response']
>(createClassroom);
import hashids from 'hashids';
import { classroomDbDesignDoc, docCount, SecurityObject, useOrCreateDB } from '../app';
import CouchDB from '../couchdb';
import { ClassroomConfig } from '../../../vue/src/server/types';

export async function deleteClassroom(classroom_id: string) {
}

export async function createClassroom(config: ClassroomConfig, teacher: string) {
    console.log(`CreateClass Request:
    ${JSON.stringify(config)}`);

    const num = await docCount('classdb-lookup') + 1; //
    const uuid = (await CouchDB.uuids(1)).uuids[0];
    const hasher = new hashids('', 6, 'abcdefghijklmnopqrstuvwxyz123456789');
    const joinCode: string = hasher.encode(num);
    const studentDbName: string = `classdb-student-${uuid}`;
    const teacherDbName: string = `classdb-teacher-${uuid}`;

    const security: SecurityObject = {
        // _id: '_security',
        admins: {
            names: [teacher],
            roles: []
        },
        members: {
            names: [],
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
        studentdb.insert(security, '_security'),
        studentdb.insert({
            _id: 'ClassroomConfig',
            ...config
        })
        teacherdb.insert(security, '_security'),
        lookup.insert({
            num,
            uuid
        } as any, joinCode)
    ]);

    let ret = {
        joincode: joinCode,
        status: 'ok',
        uuid: uuid
    };

    console.log("asofrlanstoftanlsrofastonflr");
    console.log(JSON.stringify(ret));

    return ret;
}

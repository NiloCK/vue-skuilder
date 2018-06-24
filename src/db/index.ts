import { DataShape } from '@/base-course/Interfaces/DataShape';
import { CardData, DataShapeData, DisplayableData, DocType } from '@/db/types';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

const databaseName = 'record';
const remote: PouchDB.Database = new pouch(
    'http://localhost:5984/skuilder/',
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

export function putDataShape(course: string, dataShape: DataShape) {

    const dataShapeId: string = `${course}.${dataShape.name}`;

    return remote.put({
        course,
        id: dataShapeId,
        viewList: [],
        docType: DocType.DATASHAPE
    });
}
export function getDataShape(id: PouchDB.Core.DocumentId): Promise<DataShapeData> {
    return remote.get<DataShapeData>(id);
}

export function addNote(course: string, shape: DataShape, data: any) {
    // todo: make less crappy - test for duplicate insertions
    // w/ db.find(payload). ?
    // shape.views.forEach( (view) => {
    //     remote.put({
    //         _id: view.name
    //     });
    // });

    const payload: DisplayableData = {
        course,
        data: [],
        docType: DocType.DISPLAYABLE_DATA,
        id_datashape: shape.name
    };

    shape.fields.forEach( (field) => {
        payload.data.push({
            name: field.name,
            data: data[field.name]
        });
    });

    return remote.post<DisplayableData>(payload);
}

export function getDoc<T>(id: PouchDB.Core.DocumentId): Promise<T> {
    return remote.get<T>(id);
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

    // .then( (results) => {
    //     results.docs.forEach( (doc) => {
    //         remote.get<DisplayableData>(doc._id).then( (doc) => {
    //             alert(JSON.stringify(doc));
    //         });
    //     });
    // });
}

/**
 * Returns a list of the registered dataShapes for the course
 * @param course The name of the course to search
 */
export function getDataShapes(course: string) {
    return remote.find({
        selector: {
            course,
            docType: DocType.DATASHAPE
        }
    });
    // return remote.query({
    //     selector: {}
    // })
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
    id_displayable_data: PouchDB.Core.DocumentId,
    id_view: PouchDB.Core.DocumentId) {
    return remote.post<CardData>({
        course,
        id_displayable_data,
        id_view,
        docType: DocType.CARD
    });
}

export function getCard(id: PouchDB.Core.DocumentId): Promise<CardData> {
    return remote.get<CardData>(id);
}

/**
 * Adds a View (ie, a 'Card Type' from Anki) to the database
 * @param course The name of the course that the View belongs to
 * @param name The name of the Vue component class
 * @param dataShapeName The name of the dataShape definition for hydrating this view
 */
function addView(
    course: string,
    name: string,
    dataShape: PouchDB.Core.DocumentId) {

        remote.find({
            selector: {
                course,
                docType: DocType.DATASHAPE,
                name
            }
        }).then();
}

// export function getCourseDatabase(courseName: string): PouchDB.Database {
//     return new pouch(
//         'https://nilock.cloudant.com/' + courseName,
//         {
//             skip_setup: true
//         }
//     );
// }

// export function getCourseQuestions(courseName: string) {
//     const db = getCourseDatabase(courseName);
//     return db.find({
//         fields: ['type'],
//         selector: { name: 'viewList' }
//     });
// }

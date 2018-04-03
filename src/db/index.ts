import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAuth from 'pouchdb-authentication';
import { Answer, DataShape } from '@/base-course/Course';
import { CourseListData, DataShapeData, DocType, CardData, NoteCtor } from '@/db/types';

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

/**
 *
 */
export async function getCourseList(): Promise<CourseListData> {
    return remote.get<CourseListData>('courses');
}

export function addDataShape(course: string, dataShape: DataShape) {
    return remote.post<DataShapeData>({
        docType: DocType.DATASHAPE,
        name: dataShape.name,
        course,
        fields: dataShape.fields
    });
}
export function getDataShape(id: PouchDB.Core.DocumentId): Promise<DataShapeData> {
    return remote.get<DataShapeData>(id);
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

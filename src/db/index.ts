import { Question } from '@/base-course/Course';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import { CardData, DataShapeData, DisplayableData, DocType, QuestionData } from '@/db/types';
import { debug_mode, remote_db_url } from '@/ENVIRONMENT_VARS';
import PouchDBAuth from 'pouchdb-authentication';
import pouch from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import process from 'process';

(window as any).process = process; // required as a fix for pouchdb - see #18

pouch.plugin(PouchDBAuth);
pouch.plugin(PouchDBFind);

if (debug_mode) {
    pouch.debug.enable('pouchdb:find');
}

const databaseName = 'record';
const remote: PouchDB.Database = new pouch(
    remote_db_url,
    {
        skip_setup: true
    }
);
const local: PouchDB.Database = new pouch('local');

export function getDoc<T>(id: PouchDB.Core.DocumentId): Promise<T> {
    return remote.get<T>(id);
}

export function putQuestionType(course: string, question: typeof Question) {
    const questionID = NameSpacer.getQuestionString({
        course,
        questionType: question.name
    });

    return remote.put<QuestionData>({
        _id: questionID,
        course,
        docType: DocType.QUESTIONTYPE,
        viewList: question.views.map((view) => view.name)
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
        _id: dataShapeId
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

export function addNote(course: string, shape: DataShape, data: any) {
    // todo: make less crappy - test for duplicate insertions - #15

    const payload: DisplayableData = {
        course,
        data: [],
        docType: DocType.DISPLAYABLE_DATA,
        id_datashape: shape.name
    };

    shape.fields.forEach((field) => {
        payload.data.push({
            name: field.name,
            data: data[field.name]
        });
    });

    return remote.post<DisplayableData>(payload);
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

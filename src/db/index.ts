import { Question } from '@/base-course/Course';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { NameSpacer } from '@/courses';
import { CardData, DataShapeData, DisplayableData, DocType, QuestionData, SkuilderCourseData, CardRecord } from '@/db/types';
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

export function getDoc<T extends SkuilderCourseData>(id: PouchDB.Core.DocumentId): Promise<T> {
    return remote.get<T>(id);
}

export async function putQuestionType(course: string, question: typeof Question) {
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

export function addNote(course: string, shape: DataShape, data: any) {
    // todo: make less crappy - test for duplicate insertions - #15

    const dataShapeId = NameSpacer.getDataShapeString({
        course,
        dataShape: shape.name
    });

    const payload: DisplayableData = {
        course,
        data: [],
        docType: DocType.DISPLAYABLE_DATA,
        id_datashape: dataShapeId
    };

    shape.fields.forEach((field) => {
        payload.data.push({
            name: field.name,
            data: data[field.name]
        });
    });

    return remote.post<DisplayableData>(payload).then((result) => {
        if (result.ok) {
            createCards(course, dataShapeId, result.id);
        }
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

export function putCardRecord<T extends CardRecord>(record: T) {
    remote.post<CardRecord>(record);
}

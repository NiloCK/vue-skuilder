import * as pouch from 'pouchdb-browser'
import { Answer } from '@/courses/base/Course';

pouch.plugin(require('pouchdb-authentication'));

export interface QuestionRecord {
    courseID: string,
    cardID: string,
    userAnswer: Answer,
    isCorrect: boolean,
    attempts: number,
    time: number
}

enum CourseDataTypes {
    DATA = "data",
    CARD = "card",
    VIEWLIST = "viewList"
}

interface DocID {
    id: string;
}

interface CourseData {
    type: CourseDataTypes
}

interface QuestionData extends CourseData {

}

interface ViewList extends CourseData {
    questionType: string
    viewList: Array<string>
}

interface Card extends CourseData {
    data: DocID,
    view: string
}
import { Status } from '../enums/Status';

export interface IServerRequest {
  type: ServerRequestType;
  user: string;
  response: {
    errorText?: string;
    status: Status;
    ok: boolean;
  } | null;
}

export interface CreateClassroom extends IServerRequest {
  type: ServerRequestType.CREATE_CLASSROOM;
  data: ClassroomConfig;
  response: {
    status: Status;
    ok: boolean;
    joincode: string;
    uuid: string;
  } | null;
}
export interface DeleteClassroom extends IServerRequest {
  type: ServerRequestType.DELETE_CLASSROOM;
  classID: string;
}
export interface JoinClassroom extends IServerRequest {
  type: ServerRequestType.JOIN_CLASSROOM;
  user: string;
  data: {
    joinCode: string;
    registerAs: 'student' | 'teacher' | 'aide' | 'admin';
    user: string;
  };
  response: {
    errorText?: string;
    status: Status;
    ok: boolean;
    id_course: string;
    course_name: string;
  } | null;
}
export interface LeaveClassroom extends IServerRequest {
  type: ServerRequestType.LEAVE_CLASSROOM;
  data: {
    classID: string;
  };
}

type NamespacedDatashape = string; // ${course}.datashape.${datashape}

export interface DataShape55 {
  name: NamespacedDatashape;
  questionTypes: PouchDB.Core.DocumentId[];
}

type NamespacedQuestion = string; // ${course}.question.${question}
export interface QuestionType55 {
  name: NamespacedQuestion;
  viewList: string[];
  dataShapeList: string[];
}

export interface ClassroomConfig {
  students: string[];
  teachers: string[];
  name: string;
  birthYear?: number;
  classMeetingSchedule: string;
  peerAssist: boolean;
  joinCode: string;
}

export interface CourseConfig {
  /** courseID is generated server-side. It is not present on
   * new courses at the time of writing, client-side, but always
   * present (!) when a CourseConfig is retrieved from the database
   */
  courseID?: string;
  name: string;
  description: string;
  public: boolean;
  deleted: boolean;
  creator: string;
  admins: string[];
  moderators: string[];
  dataShapes: DataShape55[];
  questionTypes: QuestionType55[];
  disambiguator?: string;
}

export interface CreateCourse extends IServerRequest {
  type: ServerRequestType.CREATE_COURSE;
  data: CourseConfig;
  response: {
    status: Status;
    ok: boolean;
    courseID: string;
  } | null;
}
export interface DeleteCourse extends IServerRequest {
  type: ServerRequestType.DELETE_COURSE;
  courseID: string;
}

export type ServerRequest =
  | CreateClassroom
  | DeleteClassroom
  | JoinClassroom
  | LeaveClassroom
  | CreateCourse
  | DeleteCourse;

export enum ServerRequestType {
  CREATE_CLASSROOM = 'CREATE_CLASSROOM',
  DELETE_CLASSROOM = 'DELETE_CLASSROOM',
  JOIN_CLASSROOM = 'JOIN_CLASSROOM',
  LEAVE_CLASSROOM = 'LEAVE_CLASSROOM',
  CREATE_COURSE = 'CREATE_COURSE',
  DELETE_COURSE = 'DELETE_COURSE',
}

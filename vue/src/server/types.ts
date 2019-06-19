import { Status } from '@/enums/Status';

interface IServerRequest {
  type: ServerRequestType;
  user: string;
  response: {
    status: Status
  } | null;
}

interface CreateClassroom extends IServerRequest {
  type: ServerRequestType.CREATE_CLASSROOM;
  className: string;
  response: {
    status: Status;
    joincode: string;
    uuid: string;
  } | null;
}
interface DeleteClassroom extends IServerRequest {
  type: ServerRequestType.DELETE_CLASSROOM;
  classID: string;
}

interface CreateCourse extends IServerRequest {
  type: ServerRequestType.CREATE_COURSE;
  data: {
    courseName: string;
    courseDescription: string;
    private: boolean;
    administrators: string[];
    moderators: string[];
  };
  response: {
    status: Status;
    id: string;
  };
}
interface DeleteCourse extends IServerRequest {
  type: ServerRequestType.DELETE_COURSE;
  courseID: string;
}

export type ServerRequest =
  CreateClassroom |
  DeleteClassroom |
  CreateCourse |
  DeleteCourse;

export enum ServerRequestType {
  CREATE_CLASSROOM = 'CREATE_CLASSROOM',
  DELETE_CLASSROOM = 'DELETE_CLASSROOM',
  CREATE_COURSE = 'CREATE_COURSE',
  DELETE_COURSE = 'DELETE_COURSE'
}

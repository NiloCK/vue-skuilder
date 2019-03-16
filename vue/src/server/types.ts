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

export type ServerRequest = CreateClassroom | DeleteClassroom;

export enum ServerRequestType {
  CREATE_CLASSROOM = 'CREATE_CLASSROOM',
  DELETE_CLASSROOM = 'DELETE_CLASSROOM'
}

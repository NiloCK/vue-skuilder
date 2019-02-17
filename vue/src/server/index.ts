import ENV from '@/ENVIRONMENT_VARS';

const SERVER = ENV.EXPRESS_SERVER_URL;

export async function createClass(): Promise<number> {
  const testData = {
    str: 'hello',
    num: 123
  };

  const xml = new XMLHttpRequest();
  xml.withCredentials = true;

  xml.open('GET', SERVER, false);
  xml.setRequestHeader('Content-Type', 'application/json');
  xml.send(JSON.stringify(testData));

  return xml.status;
}
interface IServerRequest {
  type: ServerRequestType;
  user: string;
}

interface CreateClassroom extends IServerRequest {
  type: ServerRequestType.CREATE_CLASSROOM;
  className: string;
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

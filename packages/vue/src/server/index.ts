import { Status } from '@/enums/Status';
import ENV from '../ENVIRONMENT_VARS';
import { ServerRequest } from './types';

const SERVER = ENV.EXPRESS_SERVER_PROTOCOL + '://' + ENV.EXPRESS_SERVER_URL;

export default async function serverRequest<T extends ServerRequest>(requestData: T): Promise<T> {
  try {
    const xml = new XMLHttpRequest();
    xml.withCredentials = true;
    xml.open('POST', SERVER, false);
    xml.setRequestHeader('Content-Type', 'application/json');
    xml.timeout = requestData.timeout || 7000;
    xml.ontimeout = () => {
      throw new Error('Request timed out');
    };
    xml.send(JSON.stringify(requestData));

    requestData.response = JSON.parse(xml.response);
  } catch (error) {
    requestData.response = {
      status: Status.error,
      ok: false,
      errorText: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
  return requestData;
}

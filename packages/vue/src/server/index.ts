import ENV from '../ENVIRONMENT_VARS';
import { ServerRequest } from './types';

const SERVER = ENV.EXPRESS_SERVER_PROTOCOL + '://' + ENV.EXPRESS_SERVER_URL;

export default async function serverRequest<T extends ServerRequest>(requestData: T): Promise<T> {
  const xml = new XMLHttpRequest();
  xml.withCredentials = true;
  xml.open('POST', SERVER, false);
  xml.setRequestHeader('Content-Type', 'application/json');
  xml.send(JSON.stringify(requestData));

  requestData.response = JSON.parse(xml.response);
  return requestData;
}

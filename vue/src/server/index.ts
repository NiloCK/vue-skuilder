import ENV from '@/ENVIRONMENT_VARS';

const SERVER = ENV.EXPRESS_SERVER_URL;

export async function createClass(): Promise<number> {
  // alert('hi ' + SERVER);
  const xml = new XMLHttpRequest();
  xml.withCredentials = true;
  xml.setRequestHeader('test', 'header');

  xml.open('GET', SERVER, false);
  xml.send();

  return xml.status;
}

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

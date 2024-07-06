
console.log('Mock: db/index.ts');
// src/mock/db/index.ts

import { SkuilderCourseData } from '@/db/types';
import moment from 'moment';

// Mock data
const mockDatabases: { [dbName: string]: any } = {};
const mockUsers: { [username: string]: boolean } = {};

export const pouchDBincludeCredentialsConfig = {
  fetch: (url: any, opts: any) => {
    opts.credentials = 'include';
    return Promise.resolve(new Response());
  },
};

export function getCourseDB(courseID: string): any {
  if (!mockDatabases[courseID]) {
    mockDatabases[courseID] = createMockDatabase();
  }
  return mockDatabases[courseID];
}

export async function getLatestVersion(): Promise<string> {
  return '1.0.0';
}

export async function usernameIsAvailable(username: string): Promise<boolean> {
  return !mockUsers[username];
}

export function updateGuestAccountExpirationDate(guestDB: any): void {
  const expirationDate = moment().add(2, 'months').toISOString();
  guestDB.put({
    _id: 'GuestAccountExpirationDate',
    date: expirationDate,
  });
}

export function getCourseDocs<T extends SkuilderCourseData>(
  courseID: string,
  docIDs: string[],
  options: any = {}
): Promise<any> {
  const db = getCourseDB(courseID);
  return db.allDocs({
    ...options,
    keys: docIDs,
  });
}

export function getCourseDoc<T extends SkuilderCourseData>(
  courseID: string,
  docID: string,
  options: any = {}
): Promise<T> {
  const db = getCourseDB(courseID);
  return db.get(docID, options);
}

export async function getRandomCards(courseIDs: string[]): Promise<string[]> {
  if (courseIDs.length === 0) {
    throw new Error('getRandomCards: Attempted to get all cards from no courses!');
  }

  const mockCards: string[] = [];
  for (const courseID of courseIDs) {
    for (let i = 0; i < 10; i++) {
      mockCards.push(`${courseID}-card${i}`);
    }
  }
  return mockCards;
}

export function filterAllDocsByPrefix<T>(db: any, prefix: string, opts: any = {}): Promise<any> {
  const mockDocs = Array.from({ length: 5 }, (_, i) => ({
    id: `${prefix}${i}`,
    key: `${prefix}${i}`,
    value: {},
    doc: { _id: `${prefix}${i}`, _rev: '1-mock', ...opts.include_docs ? { content: 'mock content' } : {} }
  }));

  return Promise.resolve({
    total_rows: mockDocs.length,
    offset: 0,
    rows: mockDocs
  });
}

export function getStartAndEndKeys(key: string): { startkey: string; endkey: string } {
  return {
    startkey: key,
    endkey: key + '\ufff0',
  };
}

// Helper function to create a mock database
function createMockDatabase() {
  const mockData: { [id: string]: any } = {};

  return {
    get: (id: string) => {
      if (mockData[id]) {
        return Promise.resolve(mockData[id]);
      } else {
        return Promise.reject({ status: 404, message: 'Not found' });
      }
    },
    put: (doc: any) => {
      const id = doc._id || Math.random().toString(36).substring(7);
      mockData[id] = { ...doc, _id: id, _rev: '1-mock' };
      return Promise.resolve({ ok: true, id, rev: '1-mock' });
    },
    allDocs: (options: any) => {
      const rows = Object.keys(mockData)
        .filter(key => options.keys ? options.keys.includes(key) : true)
        .map(key => ({
          id: key,
          key,
          value: { rev: mockData[key]._rev },
          doc: options.include_docs ? mockData[key] : undefined
        }));
      return Promise.resolve({ rows });
    },
    find: (query: any) => {
      const docs = Object.values(mockData)
        .filter(doc =>
          Object.entries(query.selector).every(([key, value]) => doc[key] === value)
        )
        .slice(0, query.limit || undefined);
      return Promise.resolve({ docs });
    },
  };
}

// You can add more mock implementations as needed for other functions
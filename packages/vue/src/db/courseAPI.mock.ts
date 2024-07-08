// src/mock/db/courseAPI.ts
import { CardData, DocType, Tag } from '@/db/types';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { CourseElo, blankCourseElo } from '@/tutor/Elo';
import { CourseConfig } from '@/server/types';

// Mock data
const mockCards: { [id: string]: CardData } = {};
const mockTags: { [id: string]: Tag } = {};
const mockCourseConfig: CourseConfig = {
  courseID: 'mock-course',
  name: 'Mock Course',
  dataShapes: [],
  questionTypes: [],
  description: '',
  public: false,
  deleted: false,
  creator: '',
  admins: [],
  moderators: []
};

export async function addNote55(
  courseID: string,
  codeCourse: string,
  shape: DataShape,
  data: any,
  author: string,
  tags: string[],
  uploads?: { [x: string]: PouchDB.Core.FullAttachment }
): Promise<PouchDB.Core.Response> {
  console.log(`Mock: Adding note to course ${courseID}`);
  return { ok: true, id: 'mock-note-id', rev: 'mock-rev' };
}

export async function createCards(
  courseID: string,
  datashapeID: PouchDB.Core.DocumentId,
  noteID: PouchDB.Core.DocumentId,
  tags: string[]
): Promise<void> {
  console.log(`Mock: Creating cards for note ${noteID} in course ${courseID}`);
}

export async function getCredentialledCourseConfig(courseID: string): Promise<CourseConfig> {
  console.log(`Mock: Getting credentialled course config for ${courseID}`);
  return { ...mockCourseConfig, courseID };
}

export async function addTagToCard(
  courseID: string,
  cardID: string,
  tagID: string
): Promise<PouchDB.Core.Response> {
  console.log(`Mock: Adding tag ${tagID} to card ${cardID} in course ${courseID}`);
  if (!mockCards[cardID]) {
    mockCards[cardID] = {
      course: courseID,
      id_displayable_data: [],
      id_view: 'mock-view-id',
      docType: DocType.CARD,
      elo: blankCourseElo(),
    };
  }
  if (!mockTags[tagID]) {
    mockTags[tagID] = {
      course: courseID,
      docType: DocType.TAG,
      name: tagID,
      snippet: '',
      wiki: '',
      taggedCards: [],
    };
  }
  if (!mockTags[tagID].taggedCards.includes(cardID)) {
    mockTags[tagID].taggedCards.push(cardID);
  }
  return { ok: true, id: tagID, rev: 'mock-rev' };
}

export function getTagID(tagName: string): string {
  const tagPrefix = DocType.TAG.valueOf() + '-';
  return tagName.startsWith(tagPrefix) ? tagName : tagPrefix + tagName;
}

export function getCourseDB(courseID: string): any {
  return {
    get: async (id: string) => {
      if (id === 'CourseConfig') {
        return mockCourseConfig;
      }
      throw new Error('Document not found');
    },
    post: async (doc: any) => {
      console.log(`Mock: Posting document to course ${courseID}`);
      return { ok: true, id: 'mock-doc-id', rev: 'mock-rev' };
    },
    put: async (doc: any) => {
      console.log(`Mock: Putting document to course ${courseID}`);
      return { ok: true, id: doc._id || 'mock-doc-id', rev: 'mock-rev' };
    },
  };
}

// Helper function to mock card creation (not in the original, but useful for testing)
export async function mockCreateCard(
  courseID: string,
  cardID: string,
  elo: CourseElo = blankCourseElo()
): Promise<void> {
  mockCards[cardID] = {
    course: courseID,
    id_displayable_data: [],
    id_view: 'mock-view-id',
    docType: DocType.CARD,
    elo,
  };
}

// Helper function to mock tag creation (not in the original, but useful for testing)
export async function mockCreateTag(
  courseID: string,
  tagName: string
): Promise<void> {
  const tagID = getTagID(tagName);
  mockTags[tagID] = {
    course: courseID,
    docType: DocType.TAG,
    name: tagName,
    snippet: '',
    wiki: '',
    taggedCards: [],
  };
}


// export const addTagToCard = async (courseId: string, cardId: string, tagName: string) => {
//   console.log(`Mock: Adding tag ${tagName} to card ${cardId} in course ${courseId}`);
//   return { ok: true };
// };

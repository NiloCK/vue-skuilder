// // mockCourseDB.ts
// import { DocType, Tag } from '@/db/types';
// import { StudySessionItem, StudySessionNewItem, StudySessionReviewItem } from '@/db/contentSource';
// import { ScheduledCard } from '@/db/userDB';
// import { CourseConfig } from '@/server/types';
// import { CourseElo } from '@/tutor/Elo';

// export const mockAvailableTags: Tag[] = [
//   { course: 'mock-course-001', name: 'JavaScript', snippet: 'Popular programming language', wiki: '', taggedCards: [], docType: DocType.TAG },
//   { course: 'mock-course-001', name: 'Vue.js', snippet: 'Progressive JavaScript framework', wiki: '', taggedCards: [], docType: DocType.TAG },
//   { course: 'mock-course-001', name: 'TypeScript', snippet: 'Typed superset of JavaScript', wiki: '', taggedCards: [], docType: DocType.TAG },
//   { course: 'mock-course-001', name: 'HTML', snippet: 'Markup language for web pages', wiki: '', taggedCards: [], docType: DocType.TAG },
//   { course: 'mock-course-001', name: 'CSS', snippet: 'Style sheet language', wiki: '', taggedCards: [], docType: DocType.TAG },
// ];

// export const mockAppliedTags: string[] = ['JavaScript', 'Vue.js'];

// export const getCourseTagStubs = async (courseID: string) => {
//   return {
//     rows: mockAvailableTags.map(tag => ({ doc: tag })),
//   };
// };

// export const getAppliedTags = async () => {
//   console.log('Mock: Getting applied tags')
//   return {
//     rows: mockAppliedTags.map(tagName => ({
//       value: { name: tagName },
//     })),
//   };
// };

// export const removeTagFromCard = async (courseId: string, cardId: string, tagName: string) => {
//   console.log(`Mock: Removing tag ${tagName} from card ${cardId} in course ${courseId}`);
//   return { ok: true };
// };

// export const createTag = async (tag: Tag) => {
//   console.log(`Mock: Creating tag ${tag.name}`);
//   return { ok: true };
// };

// // src/mock/db/courseDB.ts

// // Mock data
// const mockCourses: CourseConfig[] = [
//   // { courseID: 'course1', name: 'Mock Course 1', dataShapes: [], questionTypes: [] },
//   // { courseID: 'course2', name: 'Mock Course 2', dataShapes: [], questionTypes: [] },
// ];

// const mockTags: Tag[] = [
//   { course: 'course1', docType: DocType.TAG, name: 'Tag1', snippet: 'Mock Tag 1', wiki: '', taggedCards: [] },
//   { course: 'course1', docType: DocType.TAG, name: 'Tag2', snippet: 'Mock Tag 2', wiki: '', taggedCards: [] },
// ];

// export class CourseDB {
//   constructor(public id: string) { }

//   async getStudySession(cardLimit: number = 99): Promise<any[]> {
//     return [];
//   }

//   async getPendingReviews(): Promise<(StudySessionReviewItem & ScheduledCard)[]> {
//     return [];
//   }

//   async getInexperiencedCards(limit: number = 2): Promise<any[]> {
//     return [];
//   }

//   async getCardsByEloLimits(options: any = {}): Promise<string[]> {
//     return [];
//   }

//   async getCardEloData(id: string[]): Promise<CourseElo[]> {
//     return [];
//   }

//   async getELOBounds(): Promise<{ low: number; high: number }> {
//     return { low: 0, high: 100 };
//   }

//   async removeCard(id: string): Promise<any> {
//     return { ok: true };
//   }

//   async getCardDisplayableDataIDs(id: string[]): Promise<{ [card: string]: string[] }> {
//     return {};
//   }

//   async getCardsCenteredAtELO(options: any = {}, filter?: (a: string) => boolean): Promise<StudySessionItem[]> {
//     return [];
//   }

//   async getNewCards(limit: number = 99): Promise<StudySessionNewItem[]> {
//     return [];
//   }
// }

// export async function getCourseName(courseID: string): Promise<string> {
//   const course = mockCourses.find(c => c.courseID === courseID);
//   return course ? course.name : 'Unknown Course';
// }

// export async function removeCourse(courseID: string): Promise<any> {
//   return { ok: true };
// }

// export async function disambiguateCourse(course: string, disambiguator: string): Promise<void> {
//   // Mock implementation
// }

// export async function getCachedCourseList(): Promise<CourseConfig[]> {
//   return mockCourses;
// }

// export async function getCourseList(): Promise<any> {
//   return { rows: mockCourses.map(c => ({ id: c.courseID, doc: c })) };
// }

// export async function getCourseDataShapes(courseID: string): Promise<any[]> {
//   return [];
// }

// export async function getCredentialledDataShapes(courseID: string): Promise<any[]> {
//   return [];
// }

// export async function getCourseQuestionTypes(courseID: string): Promise<any[]> {
//   return [];
// }

// export async function getCourseConfig(courseID: string): Promise<CourseConfig | undefined> {
//   return mockCourses.find(c => c.courseID === courseID);
// }

// export async function deleteTag(courseID: string, tagName: string): Promise<any> {
//   return { ok: true };
// }

// export async function updateTag(tag: Tag): Promise<any> {
//   return { ok: true };
// }

// export async function getTag(courseID: string, tagName: string): Promise<Tag | undefined> {
//   return mockTags.find(t => t.course === courseID && t.name === tagName);
// }

// export function getAncestorTagIDs(courseID: string, tagID: string): string[] {
//   return [];
// }

// export async function getChildTagStubs(courseID: string, tagID: string): Promise<any> {
//   return { rows: [] };
// }

// export async function updateCardElo(courseID: string, cardID: string, elo: CourseElo): Promise<any> {
//   return { ok: true };
// }

// export async function updateCredentialledCourseConfig(courseID: string, config: CourseConfig): Promise<any> {
//   return { ok: true };
// }

// export async function getCourseConfigs(ids: string[]): Promise<any> {
//   return {
//     rows: mockCourses
//       .filter(c => ids.includes(c.courseID!))
//       .map(c => ({ id: c.courseID, doc: c }))
//   };
// }

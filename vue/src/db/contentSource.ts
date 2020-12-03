import { StudentClassroomDB } from './classroomDB';
import { CourseDB } from './courseDB';
import { ScheduledCard } from './userDB';

// todo
export interface StudySessionItem {
  qualifiedID: string;
  cardID: string;
  contentSourceType: 'course' | 'classroom';
  contentSourceID: string;
  courseID: string;
  reviewID?: string;
};

interface ContentSourceID {
  type: 'course' | 'classroom';
  id: string;
}

export interface StudyContentSource {
  getPendingReviews(): Promise<(StudySessionItem & ScheduledCard)[]>;
  getNewCards(n?: number): Promise<StudySessionItem[]>;
}

export async function getStudySource(source: ContentSourceID): Promise<StudyContentSource> {
  if (source.type === 'classroom') {
    return await StudentClassroomDB.factory(source.id);
  } else { // if (source.type === 'course') - removed so tsc is certain something returns
    return new CourseDB(source.id);
  }
}


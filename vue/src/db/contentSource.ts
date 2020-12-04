import { StudentClassroomDB } from './classroomDB';
import { CourseDB } from './courseDB';
import { ScheduledCard } from './userDB';

export interface StudySessionReviewItem extends StudySessionItem {
  reviewID: string;
}
// todo
export interface StudySessionItem {
  qualifiedID: string;
  cardID: string;
  contentSourceType: 'course' | 'classroom';
  contentSourceID: string;
  courseID: string;
  reviewID?: string;
};

export interface ContentSourceID {
  type: 'course' | 'classroom';
  id: string;
}

export interface StudyContentSource {
  getPendingReviews(): Promise<(StudySessionReviewItem & ScheduledCard)[]>;
  getNewCards(n?: number): Promise<StudySessionItem[]>;
}

export async function getStudySource(source: ContentSourceID): Promise<StudyContentSource> {
  if (source.type === 'classroom') {
    return await StudentClassroomDB.factory(source.id);
  } else { // if (source.type === 'course') - removed so tsc is certain something returns
    return new CourseDB(source.id);
  }
}


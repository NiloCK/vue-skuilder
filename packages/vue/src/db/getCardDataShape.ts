import { DataShape } from '../base-course/Interfaces/DataShape';
import Courses from '../courses';
import { NameSpacer } from '../courses/NameSpacer';
import { CourseConfig } from '../server/types';
import { log } from '@/logshim';
import { CardData, DisplayableData } from './types';
import { getCourseDB } from './courseAPI';

export async function getCardDataShape(courseID: string, cardID: string) {
  const dataShapes: DataShape[] = [];
  Courses.courses.forEach((course) => {
    course.questions.forEach((question) => {
      question.dataShapes.forEach((ds) => {
        dataShapes.push(ds);
      });
    });
  });

  // log(`Datashapes: ${JSON.stringify(dataShapes)}`);
  const db = getCourseDB(courseID);
  const card = await db.get<CardData>(cardID);
  const disp = await db.get<DisplayableData>(card.id_displayable_data[0]);
  const cfg = await db.get<CourseConfig>('CourseConfig');

  // log(`Config: ${JSON.stringify(cfg)}`);
  // log(`DisplayableData: ${JSON.stringify(disp)}`);
  const dataShape = cfg!.dataShapes.find((ds) => {
    return ds.name === disp.id_datashape;
  });

  const ret = dataShapes.find((ds) => {
    return ds.name === NameSpacer.getDataShapeDescriptor(dataShape!.name).dataShape;
  })!;

  log(`Returning ${JSON.stringify(ret)}`);
  return ret;
}

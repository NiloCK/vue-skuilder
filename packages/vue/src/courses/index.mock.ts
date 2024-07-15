import { Course } from '../base-course/Course';
import { DataShape } from '../base-course/Interfaces/DataShape';
import Vue, { VueConstructor } from 'vue';
import french from './french';
import math from './math';
import wordWork from './word-work';
import piano from './piano';
import defaultCourse from './default';
import Viewable from '../base-course/Viewable';
import { Displayable } from '../base-course/Displayable';
import pitch from './pitch';
import sightSing from './sightsing';
import { NameSpacer, ShapeDescriptor, ViewDescriptor } from './NameSpacer';

import { CourseList } from './index';

export CourseList;


const courseList: CourseList = new CourseList([
  math,
  wordWork,
  french,
  defaultCourse,
  piano,
  pitch,
  sightSing,
]);

export default courseList;

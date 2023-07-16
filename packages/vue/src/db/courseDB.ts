import { DataShape } from '../base-course/Interfaces/DataShape';
import { FieldDefinition } from '../base-course/Interfaces/FieldDefinition';
import Courses, { NameSpacer, ShapeDescriptor } from '../courses';
import { FieldType } from '../enums/FieldType';
import ENV from '../ENVIRONMENT_VARS';
import { CourseConfig } from '../server/types';
import { blankCourseElo, CourseElo, EloToNumber, toCourseElo } from '../tutor/Elo';
import _ from 'lodash';
import pouch from 'pouchdb-browser';
import { log } from 'util';
import { filterAlldocsByPrefix, pouchDBincludeCredentialsConfig } from '.';
import { GET_CACHED } from './clientCache';
import {
  StudyContentSource,
  StudySessionItem,
  StudySessionNewItem,
  StudySessionReviewItem,
} from './contentSource';
import { CardData, DisplayableData, DocType, Tag, TagStub } from './types';
import { ScheduledCard, User } from './userDB';

const courseLookupDBTitle = 'coursedb-lookup';

const courseLookupDB: PouchDB.Database = new pouch(
  ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + courseLookupDBTitle,
  {
    skip_setup: true,
  }
);

function randIntWeightedTowardZero(n: number) {
  return Math.floor(Math.random() * Math.random() * Math.random() * n);
}

export class CourseDB implements StudyContentSource {
  private log(msg: string): void {
    log(`CourseLog: ${this.id}\n  ${msg}`);
  }

  private db: PouchDB.Database;
  private id: string;

  constructor(id: string) {
    this.id = id;
    this.db = getCourseDB(this.id);
  }

  public async getStudySession(cardLimit: number = 99) {
    // cardLimit = cardLimit ? cardLimit : 999;
    const u = await User.instance();
    const userCrsdoc = await u.getCourseRegDoc(this.id);
    const activeCards = await u.getActiveCards(this.id);

    // this.log()
    const newCards = (await this.getCardsByELO(EloToNumber(userCrsdoc!.elo), cardLimit)).filter(
      (card) => {
        return activeCards.indexOf(card) === -1;
      }
    );

    // get scheduled reviews ... .... .....
    return newCards;
  }
  public async getPendingReviews(): Promise<(StudySessionReviewItem & ScheduledCard)[]> {
    type ratedReview = ScheduledCard & CourseElo;

    const u = await User.instance();
    u.getCourseRegDoc(this.id);

    const reviews = await u.getPendingReviews(this.id); // todo: this adds a db round trip - should be server side
    const elo = await this.getCardEloData(reviews.map((r) => r.cardId));

    const ratedReviews = reviews.map((r, i) => {
      const ratedR: ratedReview = {
        ...r,
        ...elo[i],
      };
      return ratedR;
    });

    ratedReviews.sort((a, b) => {
      return a.global.score - b.global.score;
    });

    return ratedReviews.map((r) => {
      return {
        ...r,
        contentSourceType: 'course',
        contentSourceID: this.id,
        cardID: r.cardId,
        courseID: r.courseId,
        qualifiedID: r.courseId + '-' + r.cardId,
        reviewID: r._id,
        status: 'review',
      };
    });
  }

  public async getInexperiencedCards(limit: number = 2) {
    return (
      await this.db.query('cardsByInexperience', {
        limit,
      })
    ).rows.map((r) => {
      const ret = {
        courseId: this.id,
        cardId: r.id,
        count: r.key,
        elo: r.value,
      };
      return ret;
    });
  }

  public async getCardsByEloLimits(
    options: {
      low: number;
      high: number;
      limit: number;
      page: number;
    } = {
      low: 0,
      high: Number.MIN_SAFE_INTEGER,
      limit: 25,
      page: 0,
    }
  ) {
    return (
      await this.db.query('elo', {
        startkey: options.low,
        endkey: options.high,
        limit: options.limit,
        skip: options.limit * options.page,
      })
    ).rows.map((r) => {
      return `${this.id}-${r.id}-${r.key}`;
    });
  }
  public async getCardEloData(id: string[]): Promise<CourseElo[]> {
    const docs = await this.db.allDocs<CardData>({
      keys: id,
      include_docs: true,
    });
    let ret: CourseElo[] = [];
    docs.rows.forEach((r) => {
      if (r.doc && r.doc.elo) {
        ret.push(toCourseElo(r.doc.elo));
      } else {
        console.warn('no elo data for card: ' + r.id);
        ret.push(blankCourseElo());
      }
    });
    return ret;
  }

  /**
   * Returns the lowest and highest `global` ELO ratings in the course
   */
  public async getELOBounds() {
    const [low, high] = await Promise.all([
      (
        await this.db.query('elo', {
          startkey: 0,
          limit: 1,
          include_docs: false,
        })
      ).rows[0].key,
      (
        await this.db.query('elo', {
          limit: 1,
          descending: true,
          startkey: 100_000,
        })
      ).rows[0].key,
    ]);

    return {
      low: low,
      high: high,
    };
  }

  public async removeCard(id: string) {
    const doc = await this.db.get<CardData>(id);
    if (!doc.docType || !(doc.docType === DocType.CARD)) {
      throw new Error(`failed to remove ${id} from course ${this.id}. id does not point to a card`);
    }
    // TODO: remove card from tags lists (getTagsByCards)
    return this.db.remove(doc);
  }

  public async getCardDisplayableDataIDs(id: string[]) {
    console.log(id);
    const cards = await this.db.allDocs<CardData>({
      keys: id,
      include_docs: true,
    });
    let ret: { [card: string]: string[] } = {};
    cards.rows.forEach((r) => {
      ret[r.id] = r.doc!.id_displayable_data;
    });

    await Promise.all(
      cards.rows.map((r) => {
        return async () => {
          ret[r.id] = r.doc!.id_displayable_data;
        };
      })
    );

    return ret;
  }

  public async getCardsCenteredAtELO(
    options: {
      limit: number;
      elo: 'user' | 'random' | number;
    } = {
      limit: 99,
      elo: 'user',
    },
    filter?: (a: string) => boolean
  ): Promise<StudySessionItem[]> {
    let targetElo: number;

    if (options.elo === 'user') {
      const u = await User.instance();

      targetElo = -1;
      try {
        const courseDoc = (await u.getCourseRegistrationsDoc()).courses.find((c) => {
          return c.courseID === this.id;
        })!;
        targetElo = EloToNumber(courseDoc.elo);
      } catch {
        targetElo = 1000;
      }
    } else if (options.elo === 'random') {
      const bounds = await GET_CACHED(`elo-bounds-${this.id}`, () => this.getELOBounds());
      targetElo = Math.round(bounds.low + Math.random() * (bounds.high - bounds.low));
      // console.log(`Picked ${targetElo} from [${bounds.low}, ${bounds.high}]`);
    } else {
      targetElo = options.elo;
    }

    let cards: string[] = [];
    let mult: number = 4;
    let previousCount: number = -1;
    let newCount: number = 0;

    while (cards.length < options.limit && newCount !== previousCount) {
      cards = await this.getCardsByELO(targetElo, mult * options.limit);
      previousCount = newCount;
      newCount = cards.length;

      console.log(`Found ${cards.length} elo neighbor cards...`);

      if (filter) {
        cards = cards.filter(filter);
        console.log(`Filtered to ${cards.length} cards...`);
      }

      mult *= 2;
    }

    const selectedCards: string[] = [];

    while (selectedCards.length < options.limit && cards.length > 0) {
      const index = randIntWeightedTowardZero(cards.length);
      const card = cards.splice(index, 1)[0];
      selectedCards.push(card);
    }

    return selectedCards.map((c) => {
      const split = c.split('-');
      return {
        courseID: this.id,
        cardID: split[1],
        qualifiedID: c,
        contentSourceType: 'course',
        contentSourceID: this.id,
        status: 'new',
      };
    });
  }
  public async getNewCards(limit: number = 99): Promise<StudySessionNewItem[]> {
    const u = await User.instance();

    const activeCards = await u.getActiveCards(this.id);
    return (
      await this.getCardsCenteredAtELO({ limit: limit, elo: 'user' }, (c: string) => {
        if (activeCards.some((ac) => c.includes(ac))) {
          return false;
        } else {
          return true;
        }
      })
    ).map((c) => {
      return {
        ...c,
        status: 'new',
      };
    });
  }

  private async getCardsByELO(elo: number, cardLimit?: number) {
    elo = parseInt(elo as any);
    const limit = cardLimit ? cardLimit : 25;

    let below: PouchDB.Query.Response<any>;
    let above: PouchDB.Query.Response<any>;
    below = await this.db.query('elo', {
      limit: Math.ceil(limit / 2),
      startkey: elo,
      descending: true,
    });

    const aboveLimit = limit - below.rows.length;

    above = await this.db.query('elo', {
      limit: aboveLimit,
      startkey: elo + 1,
    });
    // this.log(JSON.stringify(below));

    let cards = below.rows;
    cards = cards.concat(above.rows);

    let ret = cards
      .sort((a, b) => {
        let s = Math.abs(a.key - elo) - Math.abs(b.key - elo);
        if (s === 0) {
          return Math.random() - 0.5;
        } else {
          return s;
        }
      })
      .map((c) => `${this.id}-${c.id}-${c.key}`);

    const str = `below:\n${below.rows.map((r) => `\t${r.id}-${r.key}\n`)}

above:\n${above.rows.map((r) => `\t${r.id}-${r.key}\n`)}`;

    this.log(`Getting ${limit} cards centered around elo: ${elo}:\n\n` + str);

    return ret;
  }
}

function getCourseDB(courseID: string): PouchDB.Database {
  const dbName = `coursedb-${courseID}`;
  return new pouch(
    ENV.COUCHDB_SERVER_PROTOCOL + '://' + ENV.COUCHDB_SERVER_URL + dbName,
    pouchDBincludeCredentialsConfig
  );
}

// export async function incrementCourseMembership(courseID: string) {
//   courseDB.get<CourseConfig>(courseID).then( (course) => {
//     course.
//   })
// }

export async function getCourseName(courseID: string): Promise<string> {
  let ret = ((await courseLookupDB.get(courseID)) as any)['name'];
  // console.log(ret);
  return ret;
}

export async function removeCourse(courseID: string) {
  return courseLookupDB.get(courseID).then((course) => {
    return courseLookupDB.remove({
      ...course,
    });
  });
}

export async function disambiguateCourse(course: string, disambiguator: string) {
  // do NOT update the `CourseConfig` doc in the course database.
  // This information is for the course router only, and does not
  // directly impaact the running of the course itself

  // write to the lookup db
  courseLookupDB.get<CourseConfig>(course).then((cfg) => {
    courseLookupDB.put({
      ...cfg,
      disambiguator,
    });
  });
}

var courseListCache: CourseConfig[] = [];
export async function getCachedCourseList(): Promise<CourseConfig[]> {
  if (courseListCache.length) {
    return courseListCache;
  } else {
    courseListCache = (await getCourseList()).rows.map((r) => {
      return {
        ...r.doc!,
        courseID: r.id,
      };
    });
    return getCachedCourseList();
  }
}

export async function getCourseList() {
  return courseLookupDB.allDocs<CourseConfig>({
    include_docs: true,
  });
}

/**
 * Returns a list of registered datashapes for the specified
 * course.
 * @param courseID The ID of the course
 */
export async function getCourseDataShapes(courseID: string) {
  const cfg = await getCourseConfig(courseID);
  return cfg!.dataShapes;
}

export async function getCredentialledDataShapes(courseID: string) {
  const cfg = await getCredentialledCourseConfig(courseID);

  return cfg.dataShapes;
}

export async function getCourseQuestionTypes(courseID: string) {
  const cfg = await getCourseConfig(courseID);
  return cfg!.questionTypes;
}

export async function getCourseConfig(courseID: string) {
  const config = await getCourseConfigs([courseID]);
  return config.rows[0].doc;
}

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

  const db = await getCourseDB(courseID);
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

/**
 *
 * @param courseID id of the course (quilt) being added to
 * @param codeCourse
 * @param shape
 * @param data the datashape data - data required for this shape
 * @param author
 * @param uploads optional additional media uploads: img0, img1, ..., aud0, aud1,...
 * @returns
 */
export async function addNote55(
  courseID: string,
  codeCourse: string,
  shape: DataShape,
  data: any,
  author: string, // todo: no auth here - can be spoofed? Maybe at the db insert this is checked.
  tags: string[],
  uploads?: { [x: string]: PouchDB.Core.FullAttachment }
) {
  const db = await getCourseDB(courseID);

  const dataShapeId = NameSpacer.getDataShapeString({
    course: codeCourse,
    dataShape: shape.name,
  });

  const attachmentFields = shape.fields
    .map((field) => {
      // make a copy, in order NOT to append to the datashape
      const copy: FieldDefinition = {
        name: field.name,
        type: field.type,
      };
      return copy;
    })
    .filter((field) => {
      return field.type === FieldType.IMAGE || field.type === FieldType.AUDIO;
    })
    .concat([
      {
        name: 'autoplayAudio',
        type: FieldType.AUDIO,
      },
    ]);

  for (let i = 1; i < 11; i++) {
    if (data[`audio-${i}`]) {
      attachmentFields.push({
        name: `audio-${i}`,
        type: FieldType.AUDIO,
      });
    }

    if (data[`image-${i}`]) {
      attachmentFields.push({
        name: `image-${i}`,
        type: FieldType.IMAGE,
      });
    }
  }
  if (data[`audio-11`]) {
    throw new Error('Too many audio attachments');
  }
  if (data[`image-11`]) {
    throw new Error('Too many image attachments');
  }

  const attachments: { [index: string]: PouchDB.Core.FullAttachment } = {};
  const payload: DisplayableData = {
    course: courseID,
    data: [],
    docType: DocType.DISPLAYABLE_DATA,
    id_datashape: dataShapeId,
  };

  if (author) {
    payload.author = author;
  }

  attachmentFields.forEach((attField) => {
    attachments[attField.name] = data[attField.name];
  });

  //
  if (uploads) {
    Object.keys(uploads).forEach((k) => {
      attachments[k] = uploads[k];
    });
  }

  if (attachmentFields.length !== 0 || (uploads && Object.keys(uploads).length)) {
    payload._attachments = attachments;
  }

  shape.fields
    .filter((field) => {
      return field.type !== FieldType.IMAGE && field.type !== FieldType.AUDIO;
    })
    .forEach((field) => {
      payload.data.push({
        name: field.name,
        data: data[field.name],
      });
    });

  const result = await db.post<DisplayableData>(payload);

  if (result.ok) {
    // create cards
    const cards = await createCards(courseID, dataShapeId, result.id, tags);
  }

  return result;
}

function getTagID(tagName: string): string {
  const tagPrefix = DocType.TAG.valueOf() + '-';
  if (tagName.indexOf(tagPrefix) === 0) {
    return tagName;
  } else {
    return tagPrefix + tagName;
  }
}

// todo: this is actually returning full tag docs now.
//       - performance issue when tags have lots of
//         applied docs
//       - will require a computed couch DB view
export async function getCourseTagStubs(
  courseID: string
): Promise<PouchDB.Core.AllDocsResponse<Tag>> {
  log(`Getting tag stubs for course: ${courseID}`);
  const stubs = await filterAlldocsByPrefix<Tag>(
    getCourseDB(courseID),
    DocType.TAG.valueOf() + '-'
  );

  stubs.rows.forEach((row) => {
    log(`\tTag stub for doc: ${row.id}`);
  });

  return stubs;
}

export async function deleteTag(courseID: string, tagName: string) {
  tagName = getTagID(tagName);
  const courseDB = getCourseDB(courseID);
  const doc = await courseDB.get<Tag>(DocType.TAG.valueOf() + '-' + tagName);
  const resp = await courseDB.remove(doc);
  return resp;
}

export async function createTag(courseID: string, tagName: string) {
  log(`Creating tag: ${tagName}...`);
  const tagID = getTagID(tagName);
  const courseDB = getCourseDB(courseID);
  const resp = await courseDB.put<Tag>({
    course: courseID,
    docType: DocType.TAG,
    name: tagName,
    snippet: '',
    taggedCards: [],
    wiki: '',
    _id: tagID,
  });
  return resp;
}

export async function updateTag(tag: Tag) {
  const prior = await getTag(tag.course, tag.name);
  return await getCourseDB(tag.course).put<Tag>({
    ...tag,
    _rev: prior._rev,
  });
}

export async function getTag(courseID: string, tagName: string) {
  const tagID = getTagID(tagName);
  const courseDB = await getCourseDB(courseID);
  return courseDB.get<Tag>(tagID);
}

export async function addTagToCard(
  courseID: string,
  cardID: string,
  tagID: string
): Promise<PouchDB.Core.Response> {
  // todo: possible future perf. hit if tags have large #s of taggedCards.
  // In this case, should be converted to a server-request
  const prefixedTagID = getTagID(tagID);
  const courseDB = getCourseDB(courseID);
  const courseApi = new CourseDB(courseID);
  try {
    log(`Applying tag ${tagID} to card ${courseID + '-' + cardID}...`);
    const tag = await courseDB.get<Tag>(prefixedTagID);
    if (!tag.taggedCards.includes(cardID)) {
      tag.taggedCards.push(cardID);

      courseApi.getCardEloData([cardID]).then((eloData) => {
        const elo = eloData[0];
        elo.tags[tagID] = {
          count: 0,
          score: elo.global.score, // todo: or 1000?
        };
        updateCardElo(courseID, cardID, elo);
      });

      return courseDB.put<Tag>(tag);
    } else throw new Error(`Card already has this tag`);
  } catch (e) {
    log(`Tag ${tagID} does not exist...`);
    await createTag(courseID, tagID);
    return addTagToCard(courseID, cardID, tagID);
  }
}

export async function removeTagFromCard(courseID: string, cardID: string, tagID: string) {
  // todo: possible future perf. hit if tags have large #s of taggedCards.
  // In this case, should be converted to a server-request
  tagID = getTagID(tagID);
  const courseDB = getCourseDB(courseID);
  const tag = await courseDB.get<Tag>(tagID);
  _.remove(tag.taggedCards, (taggedID) => {
    return cardID === taggedID;
  });
  return courseDB.put<Tag>(tag);
}

/**
 * Returns an array of ancestor tag IDs, where:
 * return[0] = parent,
 * return[1] = grandparent,
 * return[2] = great grandparent,
 * etc.
 *
 * If ret is empty, the tag itself is a root
 */
export function getAncestorTagIDs(courseID: string, tagID: string): string[] {
  tagID = getTagID(tagID);
  const split = tagID.split('>');
  if (split.length === 1) {
    return [];
  } else {
    split.pop();
    const parent = split.join('>');
    return [parent].concat(getAncestorTagIDs(courseID, parent));
  }
}

export async function getChildTagStubs(courseID: string, tagID: string) {
  return await filterAlldocsByPrefix(getCourseDB(courseID), tagID + '>');
}

export async function getAppliedTags(id_course: string, id_card: string) {
  const db = await getCourseDB(id_course);

  const result = await db.query<TagStub>('getTags', {
    startkey: id_card,
    endkey: id_card,
    // include_docs: true
  });

  // log(`getAppliedTags looked up: ${id_card}`);
  // log(`getAppliedTags returning: ${JSON.stringify(result)}`);

  return result;
}

async function createCards(
  courseID: string,
  datashapeID: PouchDB.Core.DocumentId,
  noteID: PouchDB.Core.DocumentId,
  tags: string[]
) {
  const cfg = await getCredentialledCourseConfig(courseID);
  const dsDescriptor = NameSpacer.getDataShapeDescriptor(datashapeID);
  let questionViewTypes: string[] = [];

  for (const ds of cfg.dataShapes) {
    if (ds.name === datashapeID) {
      questionViewTypes = ds.questionTypes;
    }
  }

  for (const questionView of questionViewTypes) {
    createCard(questionView, courseID, dsDescriptor, noteID, tags);
  }
}

async function createCard(
  questionViewName: string,
  courseID: string,
  dsDescriptor: ShapeDescriptor,
  noteID: string,
  tags: string[]
) {
  tags.forEach((t) => console.log(`Adding ${t}!`));
  const qDescriptor = NameSpacer.getQuestionDescriptor(questionViewName);
  const cfg = await getCredentialledCourseConfig(courseID);

  for (const rQ of cfg.questionTypes) {
    if (rQ.name === questionViewName) {
      for (const view of rQ.viewList) {
        addCard(
          courseID,
          dsDescriptor.course,
          [noteID],
          NameSpacer.getViewString({
            course: qDescriptor.course,
            questionType: qDescriptor.questionType,
            view,
          }),
          blankCourseElo(),
          tags
        );
      }
    }
  }
}

export async function updateCardElo(courseID: string, cardID: string, elo: CourseElo) {
  if (elo) {
    // checking against null, undefined, NaN
    const cDB = getCourseDB(courseID);
    const card = await cDB.get<CardData>(cardID);
    console.log(`Replacing ${JSON.stringify(card.elo)} with ${JSON.stringify(elo)}`);
    card.elo = elo;
    return cDB.put(card); // race conditions - is it important? probably not (net-zero effect)
  }
}

/**
 * Adds a card to the DB. This function is called
 * as a side effect of adding either a View or
 * DisplayableData item.
 * @param course The name of the course that the card belongs to
 * @param id_displayable_data C/PouchDB ID of the data used to hydrate the view
 * @param id_view C/PouchDB ID of the view used to display the card
 */
async function addCard(
  courseID: string,
  course: string,
  id_displayable_data: PouchDB.Core.DocumentId[],
  id_view: PouchDB.Core.DocumentId,
  elo: CourseElo,
  tags: string[]
) {
  const card = await getCourseDB(courseID).post<CardData>({
    course,
    id_displayable_data,
    id_view,
    docType: DocType.CARD,
    elo: elo || toCourseElo(990 + Math.round(20 * Math.random())),
  });
  tags.forEach((tag) => {
    console.log(`adding tag: ${tag} to card ${card.id}`);
    addTagToCard(courseID, card.id, tag);
  });
  return card;
}

export async function getCredentialledCourseConfig(courseID: string) {
  const db = getCourseDB(courseID);
  const ret = await db.get<CourseConfig>('CourseConfig');
  ret.courseID = courseID;
  log(`Returning corseconfig:

  ${JSON.stringify(ret)}
  `);

  return ret;
}

export async function updateCredentialledCourseConfig(courseID: string, config: CourseConfig) {
  log(`Updating courseconfig:

${JSON.stringify(config)}
`);

  const db = getCourseDB(courseID);
  const old = await getCredentialledCourseConfig(courseID);

  return await db.put<CourseConfig>({
    ...config,
    _rev: old._rev,
  });
}

export async function getCourseConfigs(ids: string[]) {
  return courseLookupDB.allDocs<CourseConfig>({
    include_docs: true,
    keys: ids,
  });
}

import { Loggable } from './Loggable';

export type Update<T> = Partial<T> | ((x: T) => T);

export default class UpdateQueue extends Loggable {
  _className: string = 'UpdateQueue';
  private pendingUpdates: {
    [index: string]: Update<unknown>[];
  } = {};
  private inprogressUpdates: {
    [index: string]: boolean;
  } = {};

  private db: PouchDB.Database;

  public update<T extends PouchDB.Core.Document<{}>>(
    id: PouchDB.Core.DocumentId,
    update: Update<T>
  ) {
    this.log(`Update requested on doc: ${id}`);
    if (this.pendingUpdates[id]) {
      this.pendingUpdates[id].push(update);
    } else {
      this.pendingUpdates[id] = [update];
    }
    return this.applyUpdates<T>(id);
  }

  constructor(db: PouchDB.Database) {
    super();
    // PouchDB.debug.enable('*');
    this.db = db;
    this.log(`UpdateQ initialized...`);
    this.db.info().then((i) => {
      this.log(`db info: ${JSON.stringify(i)}`);
    });
  }
  doc = {
    cardID: 'cccfb49912aab6824f02e0d1d408ce0e',
    courseID: 'cccfb49912aab6824f02e0d1d4000aa6',
    records: [
      {
        priorAttemps: 0,
        courseID: 'cccfb49912aab6824f02e0d1d4000aa6',
        cardID: 'cccfb49912aab6824f02e0d1d408ce0e',
        isCorrect: false,
        timeSpent: 3330,
        timeStamp: '2021-01-28T19:04:54.988Z',
        userAnswer: 19,
      },
      {
        priorAttemps: 0,
        courseID: 'cccfb49912aab6824f02e0d1d4000aa6',
        cardID: 'cccfb49912aab6824f02e0d1d408ce0e',
        isCorrect: false,
        timeSpent: 3330,
        timeStamp: '2021-01-28T19:04:54.988Z',
        userAnswer: 19,
      },
      {
        priorAttemps: 1,
        courseID: 'cccfb49912aab6824f02e0d1d4000aa6',
        cardID: 'cccfb49912aab6824f02e0d1d408ce0e',
        isCorrect: true,
        timeSpent: 6727,
        timeStamp: '2021-01-28T19:04:54.988Z',
        userAnswer: 18,
      },
    ],
    lapses: 0,
    streak: 0,
    bestInterval: 0,
    _id: 'cardH-cccfb49912aab6824f02e0d1d4000aa6-cccfb49912aab6824f02e0d1d408ce0e',
    _rev: '5-5dda0bed7dde5d5a065128b87b193bb8',
  };

  private async applyUpdates<T extends PouchDB.Core.Document<{}>>(
    id: string,
    recurseDepth: number = 0
  ): Promise<T> {
    this.log(`Applying updates on doc: ${id}`);
    if (this.inprogressUpdates[id]) {
      // this.log(`Updates in progress...`);
      await this.db.info(); // stall for a round trip
      // this.log(`Retrying...`);
      return this.applyUpdates<T>(id);
    } else {
      if (this.pendingUpdates[id] && this.pendingUpdates[id].length > 0) {
        this.inprogressUpdates[id] = true;

        try {
          let doc = await this.db.get<T>(id);
          this.log(`Retrieved doc: ${id}`);
          while (this.pendingUpdates[id].length !== 0) {
            const update = this.pendingUpdates[id].splice(0, 1)[0];
            if (typeof update === 'function') {
              doc = { ...doc, ...update(doc) };
            } else {
              doc = {
                ...doc,
                ...update,
              };
            }
          }
          // for (const k in doc) {
          //   this.log(`${k}: ${typeof k}`);
          // }
          this.log(`Applied updates to doc: ${JSON.stringify(doc)}`);
          await this.db.put<T>(doc);
          this.log(`Put doc: ${id}`);

          if (this.pendingUpdates[id].length === 0) {
            this.inprogressUpdates[id] = false;
            delete this.inprogressUpdates[id];
          } else {
            return this.applyUpdates<T>(id);
          }
          return doc;
        } catch (e) {
          delete this.inprogressUpdates[id];
          this.log(`Error on attemped update: ${JSON.stringify(e)}`);
          throw e;
        }
      } else {
        throw new Error(`Empty Updates Queue Triggered`);
      }
    }
  }
}

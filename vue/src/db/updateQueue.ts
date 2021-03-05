export type Update<T> = Partial<T> | ((x: T) => T);

export default class UpdateQueue {
  private pendingUpdates: {
    [index: string]: Update<unknown>[]
  } = {};
  private inprogressUpdates: {
    [index: string]: true
  } = {};

  private db: PouchDB.Database;

  public update<T extends PouchDB.Core.Document<{}>>(id: PouchDB.Core.DocumentId, update: Update<T>) {
    if (this.pendingUpdates[id]) {
      this.pendingUpdates[id].push(update);
    } else {
      this.pendingUpdates[id] = [update];
    }
    this.applyUpdates<T>(id);
  }

  constructor(db: PouchDB.Database) {
    // PouchDB.debug.enable('*');
    this.db = db;
    console.log(`UpdateQ initialized...`);
    this.db.info().then((i) => {
      console.log(`db info: ${JSON.stringify(i)}`);
    });
  }

  private async applyUpdates<T extends PouchDB.Core.Document<{}>>(id: string, recurseDepth: number = 0): Promise<void> {
    if (this.inprogressUpdates[id]) {
      setTimeout(() => this.applyUpdates(id, recurseDepth + 1), 100 << recurseDepth);
    } else {
      if (this.pendingUpdates[id] && this.pendingUpdates[id].length > 0) {
        this.inprogressUpdates[id] = true;

        let doc = await this.db.get<T>(id);
        while (this.pendingUpdates[id].length !== 0) {
          const update = this.pendingUpdates[id].splice(0, 1)[0];
          if (typeof update === 'function') {
            doc = { ...doc, ...update(doc) };
          } else {
            doc = {
              ...doc,
              ...update
            };
          }
        }

        await this.db.put(doc);
        if (this.pendingUpdates[id].length === 0) {
          delete this.inprogressUpdates[id];
        } else {
          this.applyUpdates(id);
        }
      } else {
        throw new Error(`Empty Updates Queue Triggered`);
      }
    }
  }
}
// import { remote } from './';
import { log } from 'util';
import pouch from 'pouchdb-browser';

class LocalCache {
  private readonly local = new pouch('localCache');
  private readonly remote = new pouch();
  private doc_ids: PouchDB.Core.DocumentId[] = [];

  /**
   *
   */
  constructor() {
    this.init();
  }


  public async getDoc<T>(
    _id: PouchDB.Core.DocumentId,
    options: PouchDB.Core.GetOptions = {}
  ): Promise<T> {
    try {
      const ret = await this.local.get<T>(_id, options);
      return ret;
    } catch (e) {
      // console.log(e);
      log(e);
      this.cacheDoc(_id);
      return await this.remote.get<T>(_id, options);
    }
  }

  public cacheDoc(_id: PouchDB.Core.DocumentId) {
    const rep = this.local.replicate.from(this.remote, {
      doc_ids: [_id],
      live: true
    });

    rep.on('complete', async (info) => {
      const doc = await this.getDoc<PouchDB.Core.Document<{
        [index: string]: any
      }>>(_id);

      Object.keys(doc).forEach((key) => {
        if (key.indexOf('id_') === 0) {
          const k: any = doc[key];
        }
      });

      for (const field in doc) {
        if (field.indexOf('id_') === 0) {
          if ((doc as object).hasOwnProperty(field)) {
            const id: string = (doc[field] as any) as string;

            this.cacheDoc(id);
          }
        }
      }
    });
  }

  private async init() {
    this.doc_ids = (await this.local.allDocs({
      include_docs: false
    })).rows.map((row) => {
      return row.id;
    });
  }

}

// const lc = new LocalCache();

export default new LocalCache();

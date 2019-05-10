import { remote } from './';
import { log } from 'util';

class LocalCache {
  private readonly local = new PouchDB('localCache');
  private readonly remote = remote;
  private doc_ids: PouchDB.Core.DocumentId[] = [];

  /**
   *
   */
  constructor() {
    this.init();
  }


  public async getDoc<T>(_id: PouchDB.Core.DocumentId): Promise<T> {
    try {
      const ret = await this.local.get(_id) as T;
      return ret;
    } catch (e) {
      // console.log(e);
      log(e);
      this.cacheDoc(_id);
      return await this.remote.get(_id);
    }
  }

  public cacheDoc(_id: PouchDB.Core.DocumentId) {
    const rep = this.local.replicate.from(this.remote, {
      doc_ids: [_id],
      live: true
    });

    rep.on('complete', async (info) => {
      const doc = await this.getDoc(_id);
      for (const field in doc) {
        if (field.indexOf('id_') === 0) {
          if ((doc as object).hasOwnProperty(field)) {
            const id: any = doc[field];

            this.cacheDoc(doc[field] as any as PouchDB.Core.DocumentId);
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

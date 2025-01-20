// import { remote } from './';
import pouch from 'pouchdb-browser';

class LocalCache {
  private readonly local = new pouch('localCache');
  private readonly remote = new pouch();
  private doc_ids: PouchDB.Core.DocumentId[] = [];

  // [ ] LocalCache
  //
  // The localcache is a pdb database that stores course and class information locally
  //
  // intent is to allow offline access, both as a 'fallback' and as an 'installable' option
  //
  // for the 'fallback', the localcache should dynamically keep local copy of 'some amount' of
  // specifically relevant data, and update it as needed when connected to the internet
}

// const lc = new LocalCache();

export default new LocalCache();

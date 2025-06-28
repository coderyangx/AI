import { LRUCache } from "lru-cache";

interface S3Object {
  data: Buffer;
  metadata: {
    type: string; // mime-type
  };
}

export class MemoryS3 {
  private _store: LRUCache<string, S3Object>;

  constructor() {
    this._store = new LRUCache({
      max: 100,
      ttl: 1000 * 3600 * 24,
    });
  }

  putObject(key: string, obj: S3Object) {
    this._store.set(key, obj);
  }

  getObject(key: string) {
    return this._store.get(key);
  }

  toJSON() {
    return "[Object MemoryS3]";
  }
}

export const s3 = new MemoryS3();

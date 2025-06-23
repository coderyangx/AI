import { LRUCache } from 'lru-cache';

class ImageCacheManager {
  private _client: LRUCache<string, string>;

  constructor() {
    this._client = new LRUCache({
      max: 100,
      ttl: 1000 * 3600 * 24
    });
  }

  get(uuid: string) {
    const all = Array.from(this._client.entries());
    console.log(JSON.stringify(all))
    return this._client.get(uuid);
  }

  set(uuid: string, result: string) {
    this._client.set(uuid, result);
  }
}

export const imageCacheManager = new ImageCacheManager()

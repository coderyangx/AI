import { LRUCache } from "lru-cache";

interface ToolCacheManagerOptions {
  ttl?: number;
}

export class ToolCacheManager {
  private _client: LRUCache<string, string>;

  constructor(options: ToolCacheManagerOptions) {
    this._client = new LRUCache({
      max: 100,
      ttl: options?.ttl ?? 1000 * 60 * 10,
    });
  }

  get(args: unknown) {
    const result = this._client.get(JSON.stringify(args));
    return result;
  }

  set(args: unknown, result: any) {
    this._client.set(JSON.stringify(args), result);
  }
}

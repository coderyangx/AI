import { LRUCache } from "lru-cache";

class SessionMemoryManager {
  private _client: LRUCache<string, SessionMemory>;

  constructor() {
    this._client = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60,
    });
  }

  get(id: string) {
    const result = this._client.get(id);
    if (result) {
      return result;
    }
    const newOne = new SessionMemory();
    this.set(id, newOne);
    return newOne;
  }

  set(id: string, result: SessionMemory) {
    this._client.set(id, result);
  }
}

export class SessionMemory {
  private _client: LRUCache<string, any>;

  constructor() {
    this._client = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24,
    });
  }

  get(key: string) {
    const result = this._client.get(key);
    return result;
  }

  set(key: string, result: any) {
    this._client.set(key, result);
  }

  toJSON() {
    return "[Object SessionMemory]";
  }
}

export const sessionMemoryManager = new SessionMemoryManager();

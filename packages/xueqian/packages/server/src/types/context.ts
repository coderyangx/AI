import type { CoreMessage } from "ai";
import type { SessionMemory } from "../lib/cache/session";
import type { MemoryS3 } from "../lib/memory-s3";
import type { NL2SQLDataService } from "../data/service";

export interface IRunContext {
  cookie: string;
  view: string;
  env: string;
  origin: string;
  history?: CoreMessage[];
  memory?: SessionMemory;
  s3?: MemoryS3;
  dataSvc?: NL2SQLDataService;
  presetId?: string;
  presetOptions?: Record<string, any>;
  sessionId?: string;
}

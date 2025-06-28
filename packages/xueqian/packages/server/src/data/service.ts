import { QUERY_CONFIG } from "../lib/query/dsl-schema";
import { IRunContext } from "../types/context";
import "./executors/index.js";
import { executorRegistryManager } from "./manager/executor.js";
import { presetManager } from "./manager/preset.js";

export class NL2SQLDataService {
  private ctx: IRunContext;

  constructor(ctx: IRunContext) {
    this.ctx = ctx;
  }

  private getPreset(presetId?: string) {
    console.log("presetId", presetId, this.ctx.presetId);
    const preset = presetManager.getPreset(presetId || this.ctx.presetId);
    if (!preset) {
      throw new Error("无匹配/可用的数据预设项");
    }

    return preset;
  }

  async getDataSchema(presetId?: string) {
    const preset = this.getPreset(presetId);

    return preset.database_schema(this.ctx);
  }

  async executeQuery(dsl: QUERY_CONFIG["dsl_query"], presetId?: string) {
    const preset = this.getPreset(presetId);
    console.log("preset.query_executor", preset.query_executor);
    const execute = executorRegistryManager.getExecutor(preset.query_executor);

    if (!execute) {
      throw new Error("无可用的数据查询执行器");
    }

    return execute(dsl, this.ctx);
  }

  toJSON() {
    return "[Object NL2SQLDataService]";
  }
}

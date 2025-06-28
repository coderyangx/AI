import { sequentialThinkingToolFactory } from "./sequential-thinking.js";
import { chartToolFactory } from "./generate-chart.js";
import { queryDataToolFactory } from "./query-data.js";
import { dateTools } from "./date.js";
import { mathTools } from "./math.js";
import type { IRunContext } from "../types/context.js";

export const toolSetFactory = (ctx: IRunContext) => {
  const tools = [
    // sequentialThinkingToolFactory,
    chartToolFactory,
    queryDataToolFactory,
  ].reduce((prev, curr) => {
    const tool = curr(ctx);
    prev[tool.name] = tool;
    return prev;
  }, {});

  return {
    ...tools,
    ...dateTools,
    ...mathTools,
  };
};

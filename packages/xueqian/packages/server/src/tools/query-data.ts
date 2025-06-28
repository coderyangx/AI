import type { IToolFactory } from "../types/tool.js";
import { z } from "zod";

export const queryDataToolFactory: IToolFactory = (ctx) => {
  return {
    name: "query-data",
    description: `解析数据查询意图 DSL，并查询数据`,
    parameters: z.object({
      hint: z
        .string()
        .describe(
          "数据查询的提示（hint），该信息由`handoff.query-design`工具生成"
        ),
      goal: z
        .string()
        .describe("数据查询任务的目标，由`handoff.query-design`工具提供"),
      query_id: z
        .string()
        .describe(
          "数据查询意图 DSL 的存储 ID，由`handoff.query-design`工具生成"
        ),
    }),
    async execute(args, options) {
      console.log("query", JSON.stringify(args, null, 2));
      try {
        const mem = ctx.memory?.get(args.query_id);
        console.log("dsl from memory", mem);
        if (!mem) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "Error: 不存在的查询 DSL，请重新设计",
              },
            ],
          };
        }
        const result = await ctx.dataSvc?.executeQuery(mem?.dsl_query);
        ctx.memory?.set(`${args.query_id}.result`, result);
        return result;
      } catch (e) {
        console.log(e);
        return {
          content: [
            {
              type: "text",
              text: `Failed to get table records.
:::hidden
Debug 信息:

Error -> ${e.message}
:::
`,
            },
          ],
          isError: true,
        };
      }
    },
  };
};

import { generateObject } from "ai";
import type { Handler } from "hono";
import { getModel } from "../lib/ai/model-provider.js";
import { z } from "zod";
import { NL2SQLDataService } from "../data/service.js";

export const Recommendations: Handler = async (c) => {
  const view = c.req.header("X-FORM-VIEW") || "";
  const env = c.req.header("X-ENV") || "";

  const dataSvc = new NL2SQLDataService({
    view,
    env,
    cookie: c.req.header("Cookie"),
    origin: c.req.header("Origin") || "",
    presetId: c.req.header("X-DATA-PRESET") || "kuaida",
  });

  try {
    const formInfo = await dataSvc.getDataSchema();

    const { object } = await generateObject({
      model: getModel("gpt-4.1"),
      temperature: 0.5,
      schema: z.object({
        questions: z.array(z.string()),
      }),
      prompt: `你是一位顶尖的数据可视化与分析专家，具备卓越的表格数据处理能力和敏锐的商业洞察力。请基于以下数据表的结构信息，提出5条高质量、可深入洞察业务、易于可视化的推荐分析问题，问题需要简短精炼，不要使用疑问语气。数据表的基本结构信息如下：
---
${JSON.stringify(formInfo)}
---
`,
    });

    return c.json(object?.questions || []);
  } catch {
    return c.json([]);
  }
};

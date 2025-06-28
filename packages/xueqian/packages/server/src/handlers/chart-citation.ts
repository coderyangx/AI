import type { Handler } from "hono";
import { sessionMemoryManager } from "../lib/cache/session.js";
import { getCookie } from "hono/cookie";

export const ChartCitation: Handler = async (c) => {
  const sessionId = getCookie(c, "chatSessionId");

  if (!sessionId) {
    return c.json(null);
  }
  const memManager = sessionMemoryManager.get(sessionId);

  const { query_id } = await c.req.json();

  const dsl = memManager.get(query_id);
  const result = memManager.get(`${query_id}.result`);

  return c.json({
    query: dsl,
    result,
  });
};

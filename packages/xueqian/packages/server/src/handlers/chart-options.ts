import type { Handler } from "hono";
import { sessionMemoryManager } from "../lib/cache/session.js";
import { getCookie } from "hono/cookie";

export const ChartOptions: Handler = async (c) => {
  const sessionId = getCookie(c, "chatSessionId");

  if (!sessionId) {
    return c.json(null);
  }
  const memManager = sessionMemoryManager.get(sessionId);

  const { id } = await c.req.json();

  const config = memManager.get(id);

  if (!config) {
    return c.text("Not found", 404);
  }

  return c.json(JSON.parse(config));
};

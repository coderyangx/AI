import type { Handler } from "hono";
import { getCookie } from "hono/cookie";
import { sessionMemoryManager } from "../lib/cache/session.js";
import { DSLTranslator } from "../lib/query/dsl-to-sql.js";

export const SQLPreview: Handler = async (c) => {
  const sessionId = getCookie(c, "chatSessionId");
  const memory = sessionMemoryManager.get(sessionId);
  if (!memory) {
    return c.json(null, 404);
  }

  const { query_id } = await c.req.json();
  const mem = memory.get(query_id);
  if (!mem) {
    return c.json(null, 404);
  }

  const sqlGenerator = new DSLTranslator(
    {
      ...mem.dsl_query,
      from: "?",
    },
    []
  );
  const sql = sqlGenerator.toSQL();

  return c.json(
    {
      sql,
      dsl: mem.dsl_query,
    },
    200
  );
};

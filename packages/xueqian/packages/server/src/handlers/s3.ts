import type { Handler } from "hono";
import { s3 } from "../lib/memory-s3/index.js";

export const S3Preview: Handler = async (c) => {
  const key = c.req.param("key");
  const obj = s3.getObject(key);
  if (!obj) {
    return c.text("内容已过期", 200);
  }

  return c.body(obj.data, 200, {
    "Content-Type": obj.metadata.type,
    "Content-Length": obj.data.byteLength.toString(),
  });
};

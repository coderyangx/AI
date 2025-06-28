import type { Handler } from "hono";
import { s3 } from "../lib/memory-s3/index.js";
import { nanoid } from "nanoid";

export const S3Upload: Handler = async (c) => {
  try {
    // 获取formData
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // 读取文件内容
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 获取文件类型
    const fileType = file.type || "application/octet-stream";

    // 生成唯一的文件名
    const fileExtension = file.name.split(".").pop() || "";
    const key = `${nanoid(10)}.${fileExtension}`;

    // 上传到S3
    s3.putObject(key, {
      data: fileBuffer,
      metadata: {
        type: fileType,
      },
    });

    // 构建URL
    const origin = c.req.header("Origin") || "";
    const url = `${origin}/ai-agent/object/${key}`;

    return c.json({ url, key });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
};

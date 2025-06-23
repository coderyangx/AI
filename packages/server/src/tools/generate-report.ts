import type { Tool } from "ai";
import { z } from "zod";
import { formFetch } from "../lib/request/form";
import FormData from "form-data";
// import { marked } from 'marked';

const getBpmCode = async (ctx) => {
  const result = await formFetch(ctx).get<{
    bpmCode: string;
  }>(`/api/zeroconsole/view/showInfo/${ctx.view}`);
  const { bpmCode } = result;
  return bpmCode;
};

const uploadFile = async (args: any, ctx: any) => {
  // markdown to html
  // const markdown = args.content;

  // const html = await marked.parse(markdown);
  const html = args.content;

  const formData = new FormData();
  formData.append("file", Buffer.from(html), {
    contentType: "text/html",
    filename: "report.html",
  });

  const bpmCode = await getBpmCode(ctx);
  const result = await formFetch(ctx)
    .post<{ url: string }>(`/api/file/upload/${bpmCode}`, formData)
    .catch((e) => {
      console.log(e);
      throw e;
    });

  return result.url;
};

export const generateHtmlReportToolFactory = (ctx: any) => {
  const tool: Tool & { id: string } = {
    id: "generate-html-report",
    description:
      "Upload html report, return the report download link. It is a must to obtain the user's consent before using it.",
    parameters: z.object({
      content: z.string().describe("The content of html format report"),
    }),
    async execute(args, { toolCallId }) {
      try {
        ctx.stream?.appendMessageAnnotation({
          type: "tool-status",
          toolCallId,
          status: "in-progress",
        });
        console.log("report args", JSON.stringify(args, null, 2));
        const url = await uploadFile(args, ctx);
        console.log(url);

        return {
          content: {
            type: "text",
            text: `The report download link is: ![Report](${url})`,
          },
        };
      } catch (e) {
        console.log(e);
        return {
          content: {
            type: "text",
            text: "Failed to generate and upload html report",
          },
          isError: true,
        };
      }
    },
  };

  return tool;
};

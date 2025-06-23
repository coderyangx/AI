import type { Tool } from "ai";
import { z } from "zod";
import * as echarts from "echarts";
import { imageCacheManager } from "../lib/cache/image";
import { nanoid } from "nanoid";
import { formFetch } from "../lib/request/form";
import FormData from "form-data";
import sharp from "sharp";

const generateChartSVG = async (chartConfig: any, ctx: any) => {
  const chart = echarts.init(null, null, {
    renderer: "svg",
    devicePixelRatio: 2,
    ssr: true,
    width: 400,
    height: 300,
  });

  chart.setOption({
    textStyle: {
      fontFamily: "PingFang SC, microsoft yahei, sans-serif", // 确保服务器有这些字体
    },
    yAxis: {},
    ...chartConfig,
  });

  const svgStr = chart.renderToSVGString();

  // console.log('svgStr', svgStr)

  chart.dispose();

  // convert to png, 后端不支持 svg 上传
  const png = await sharp(Buffer.from(svgStr)).png().toBuffer();

  // upload
  const formData = new FormData();
  formData.append("file", png, {
    contentType: "image/png",
    filename: "chart.png",
  });
  const result = await formFetch(ctx)
    .post<{ url: string }>("/api/file/upload", formData)
    .catch((e) => {
      console.log(e);
      throw e;
    });

  return result.url;
};

export const generateChartToolFactory = (ctx: any) => {
  const tool: Tool & { id: string } = {
    id: "generate-chart",
    description: "Generate a chart using QuickChart",
    parameters: z.object({
      xAxis: z.object({
        name: z.string().describe("The name of xAxis"),
        data: z.array(z.string()).describe("The data items of xAxis"),
      }),
      title: z
        .object({
          text: z.string().describe("The chart name"),
        })
        .optional(),
      series: z
        .array(
          z.object({
            name: z.string().describe("The name of a data series"),
            type: z.string().describe("Chart type (bar, line, pie, radar)"),
            data: z
              .array(z.number())
              .describe("The data points of a data series"),
          })
        )
        .describe("The data series of yAxis"),
    }),
    async execute(args, { toolCallId }) {
      try {
        ctx.stream?.appendMessageAnnotation({
          type: "tool-status",
          toolCallId,
          status: "in-progress",
        });
        console.log("echarts args", JSON.stringify(args, null, 2));
        const url = await generateChartSVG(args, ctx);
        console.log(url);

        return {
          content: {
            type: "text",
            text: `The chart image is: ![${
              args.title?.text || "Chart"
            }](${url})`,
          },
        };
      } catch (e) {
        console.log(e);
        return {
          content: {
            type: "text",
            text: "Failed to generate chart",
          },
          isError: true,
        };
      }
    },
  };

  return tool;
};

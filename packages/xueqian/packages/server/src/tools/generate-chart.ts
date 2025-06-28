import type { IToolFactory } from "../types/tool.js";
import { z } from "zod";
import * as echarts from "echarts";
import { formFetch } from "../lib/request/form.js";
import FormData from "form-data";
import sharp from "sharp";
import { IRunContext } from "../types/context.js";
import { nanoid } from "nanoid";
import { FORM_API_SERVER_MAP } from "../const/index.js";
import { merge } from "lodash-es";

const generateChartSVG = async (chartConfig: any, ctx: IRunContext) => {
  const chart = echarts.init(null, null, {
    renderer: "svg",
    devicePixelRatio: 3,
    ssr: true,
    width: 400,
    height: 300,
  });

  chart.setOption(
    merge(
      {
        title: {
          textStyle: {
            fontSize: 12,
          },
        },
        xAxis: {
          nameTextStyle: {
            fontSize: 0,
          },
        },
      },
      {
        textStyle: {
          fontFamily: "PingFang SC, microsoft yahei, sans-serif", // 确保服务器有这些字体
        },
        yAxis: {},
        ...chartConfig,
      }
    )
  );

  const svgStr = chart.renderToSVGString();

  // console.log('svgStr', svgStr)

  chart.dispose();

  // convert to png, 后端不支持 svg 上传
  // const png = await sharp(Buffer.from(svgStr)).png().toBuffer();

  // upload
  // const formData = new FormData();
  // formData.append("file", png, {
  //   contentType: "image/png",
  //   filename: "chart.png",
  // });
  // const result = await formFetch(ctx)
  //   .post<{ url: string }>("/api/file/upload", formData)
  //   .catch((e) => {
  //     console.log(e);
  //     throw e;
  //   });

  // return result.url;

  const key = nanoid(6) + ".svg";
  ctx.s3?.putObject(key, {
    data: Buffer.from(svgStr),
    metadata: {
      type: "image/svg+xml",
    },
  });

  return `${ctx.origin}/ai-agent/object/${key}`;
};

export const chartToolFactory: IToolFactory = (c) => {
  return {
    name: "generate-chart",
    description: "使用 ECharts 生成可视化图表",
    parameters: z.object({
      chartOptions: z.object({
        xAxis: z
          .object({
            name: z.string().describe("The name of xAxis"),
            data: z.array(z.string()).describe("The data items of xAxis"),
          })
          .describe("X 轴配置，当使用 bar 类型图表时，不需要提供该配置")
          .optional(),
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
                .array(
                  z.union([
                    z.number(),
                    z.object({
                      value: z.number(),
                      name: z.string(),
                    }),
                  ])
                )
                .describe("The data points of a data series"),
            })
          )
          .describe("The data series of yAxis"),
      }),
      queryIds: z
        .array(z.string())
        .describe("可视化图表的数据查询使用的 query_id 列表"),
    }),
    async execute(args, options) {
      try {
        console.log("echarts args", JSON.stringify(args, null, 2));
        const url = await generateChartSVG(args.chartOptions, c);
        console.log(url);

        const configId = nanoid(6);
        c.memory?.set(configId, JSON.stringify(args));

        return {
          content: [
            {
              type: "text",
              text: `:::hidden
${JSON.stringify({
  description: "仅生成 HTML 报告时可引用的图片地址",
  url,
})}
:::
`,
            },
            {
              type: "text",
              content: `可交互图表为: 
:::echarts{id=${configId}} 
:::       
`,
            },
          ],
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
};

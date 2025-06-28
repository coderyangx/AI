import {
  type LanguageModelV1,
  Message,
  type ToolSet,
  generateObject,
} from "ai";
import type { IRunContext } from "../types/context.js";
import { getModel } from "../lib/ai/model-provider.js";
import { nanoid } from "nanoid";
import { BaseAgent } from "./base.js";
import { FORM_API_SERVER_MAP } from "../const/index.js";
import { format } from "date-fns";
import { z } from "zod";
import * as cheerio from "cheerio";

const embedSvgAsBase64 = async (html: string) => {
  const $ = cheerio.load(html);
  const imageElements = $('img[src$=".svg"]');
  const downloadPromises: Promise<void>[] = [];

  imageElements.each((index, element) => {
    const $element = $(element);
    const imageUrl = $element.attr("src"); // 获取图片的 URL

    if (imageUrl) {
      downloadPromises.push(
        (async () => {
          try {
            const response = await fetch(imageUrl);

            if (!response.ok) {
              throw new Error(
                `HTTP 错误！状态码: ${response.status}，URL: ${imageUrl}`
              );
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const mimeType = "image/svg+xml";
            const base64Content = buffer.toString("base64");

            $element.attr("src", `data:${mimeType};base64,${base64Content}`);
            console.log(`成功嵌入 SVG: ${imageUrl}`);
          } catch (error) {
            console.error(
              `下载或嵌入 SVG 失败，URL: ${imageUrl}。错误信息:`,
              error instanceof Error ? error.message : error
            );
          }
        })()
      );
    }
  });

  await Promise.all(downloadPromises);

  return $.html();
};

const uploadFile = async (args: any, ctx: IRunContext) => {
  let html = args.content;

  try {
    html = await embedSvgAsBase64(html);
  } catch {
    // ignore
  }

  const key = nanoid(6) + ".html";
  ctx.s3?.putObject(key, {
    data: Buffer.from(html),
    metadata: {
      type: "text/html",
    },
  });

  return `${ctx.origin}/ai-agent/object/${key}`;
};

export class HtmlReportGenerateAgent extends BaseAgent {
  name: string;
  description: string;

  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    return `HTML 报告生成专家角色

---

## 1. 角色定位

你是一位顶尖的 HTML 报告生成专家，专注于将数据分析的图文结果转化为结构清晰、视觉优雅、内容翔实且具备响应式设计的 HTML 报告。你精通内容组织、视觉设计（遵循 Apple 设计风格），并能将复杂的分析结论以简洁直观的方式呈现给用户。

---

### 2. 系统信息

-   当前日期/时间：\`${format(new Date(), "yyyy-MM-dd HH:mm:ss")}\`
-   当前时区：\`UTC+8\`
-   工作环境：你将接收一个包含数据分析结果（图表、文字洞察、数据查询事实结论）的上下文信息，并基于此生成最终的 HTML 报告。

---

### 3. 核心能力

#### 3.1. 内容整合与组织

-   **接收与解析上下文：** 准确接收并理解传递过来的数据分析结果，包括：
    -   **数据查询事实结论：** 以表格形式呈现的原始查询结果或关键数据点。
    -   **可视化图表：** 用于报告展示的静态图片（如 PNG, JPEG）或 SVG 格式的图表。
    -   **数据分析洞察：** 对图表和数据进行解读的文字分析。
    -   **最终结论与建议：** 汇总分析发现和提出改进建议的文字内容。
-   **结构化布局：** 按照预设的报告结构（如引言、数据洞察、结论与建议）合理组织所有内容，确保逻辑流畅、层次分明。
-   **图文互补：** 将可视化图表与其对应的文字分析洞察紧密结合，确保图文并茂，共同支撑分析结论。

#### 3.2. 视觉设计与风格遵循

-   **Apple 风格设计：** 报告视觉设计严格遵循 Apple 设计风格原则，包括：
    -   **简洁、清晰、优雅：** 整体设计风格保持极简，避免冗余元素。
    -   **卡片式布局：** 使用卡片式布局组织内容模块，增强视觉分离和阅读体验。
    -   **充足留白：** 确保内容周围有足够的空白区域，提升页面整洁度和呼吸感。
    -   **无衬线字体：** 优先使用系统无衬线字体（如 San Francisco 或其替代品），保证清晰度和现代感。
    -   **圆角元素与细微阴影：** 适当运用圆角和细微阴影效果，增加界面的柔和感和层次感。
    -   **专业和谐色彩搭配：** 采用专业、低饱和度、和谐统一的色彩方案。
    -   **高质量图标：** 适当使用高质量、简洁的图标来辅助信息传达。
-   **响应式设计：** 生成的 HTML 报告必须具备良好的响应式布局，确保在不同设备（桌面、平板、手机）上均能提供最佳的阅读体验。

#### 3.3. HTML 生成与输出

-   **单一完整 HTML 文件：** 生成一个单一、完整且自包含的 HTML 文件内容。所有样式 (CSS) 和必要的脚本 (JS) 应内联或嵌入，以确保文件独立性。最终输出必须是可直接另存为 HTML 文件的内容，不应包含在任何 Markdown 代码块或其他格式中
-   **可读性与可访问性：** 确保生成的 HTML 代码结构良好，易于阅读和维护，并尽可能考虑无障碍性。
-   **禁止交互式图表：** 报告中使用的图表必须是静态图片（如 \`<img>\` 标签），严禁使用 ECharts 或其他交互式 JavaScript 图表库来渲染图表，以保证兼容性和文件独立性。
-   **报告生成时间：** 在报告的**末尾**明确标注报告的生成时间，格式为“报告生成时间：YYYY-MM-DD HH:MM:SS (时区)”。

---

### 4. 工作流程

1.  **接收分析结果：** 接收上一个 Agent 传递过来的包含“数据查询事实结论”、“可视化图表”、“数据分析洞察”以及“最终结论与建议”的结构化数据。
2.  **内容解析与映射：** 解析输入内容，将其映射到 HTML 报告的相应结构中。
3.  **HTML 结构构建：** 根据 Apple 设计风格，构建报告的整体 HTML 骨架和卡片式布局。
4.  **内容填充与样式应用：** 将解析后的文本、表格和图片内容填充到 HTML 结构中，并应用预设的 CSS 样式。
5.  **生成完整 HTML：** 输出一个包含所有内容、样式和布局的完整 HTML 文件内容，并在报告末尾添加生成时间。

---

### 5. 报告结构要求

生成的 HTML 报告应至少包含以下章节：

-   **报告标题：** 清晰的报告名称。
-   **引言/概述：** 简要介绍报告目的和分析范围。
-   **数据洞察：**
    -   对于每一个主要的数据洞察点：
        -   **数据查询事实结论：** 以表格形式展示支撑该洞察的原始或汇总数据。
        -   **数据可视化图表：** 展示该洞察的图表。
        -   **分析洞察：** 对图表和数据进行详细的文字解读，解释发现的模式、趋势或异常。
-   **结论与建议：**
    -   **核心发现总结：** 提炼报告中最重要的发现。
    -   **改进建议/行动方案：** 基于数据洞察提出的具体、可行的业务建议。
-   **报告生成时间：** 在报告末尾显示，格式为“报告生成时间：YYYY-MM-DD HH:MM:SS (时区)”。

---

### 6. 交互原则

-   **单向输出：** 作为一个独立的 Agent，你将主要负责接收输入并生成最终的 HTML 报告，不需要与用户进行多轮交互。
-   **完整性优先：** 确保生成的 HTML 报告内容完整，所有传入的信息都得到妥善展示。

---

### 7. 健壮性与错误处理

-   **异常情况应对：** 如果接收到的输入数据格式不正确或缺失关键信息，应清晰地指出问题并终止报告生成，提供错误信息。

---
`;
  };

  model: LanguageModelV1;
  tools: ToolSet;

  ctx: IRunContext;

  private minifyMessage(msg: Message) {
    if (msg.parts) {
      msg.parts = msg.parts.filter((item) => {
        if (item.type === "text") {
          return true;
        }
        if (
          item.type === "tool-invocation" &&
          ["data-query", "generate-chart"].includes(
            item.toolInvocation.toolName
          )
        ) {
          return true;
        }
        return false;
      });
    }
    return msg;
  }

  constructor(ctx: IRunContext) {
    super({ ctx });
    this.name = "generate-html-report";
    this.description =
      "基于已有的上下文信息，提取数据分析的图文内容，并生成最终的 HTML 报告供下载";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1"); // anthropic.claude-sonnet-4
    this.tools = {};
  }

  async run() {
    const system = await this.instructions(this.ctx);
    const {
      object: { html },
    } = await generateObject({
      model: this.model,
      system,
      temperature: 0.7,
      maxTokens: 32767,
      messages: (this.ctx.history || []).map((item) =>
        this.minifyMessage(item as Message)
      ),
      schema: z.object({
        html: z.string().describe("生成的 HTML 文件源码"),
      }),
    });

    console.log("text", html);

    const url = await uploadFile({ content: html }, this.ctx);

    return `报告下载地址: ![Report](${url})`;
  }

  async onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any> {
    return this.run();
  }
}

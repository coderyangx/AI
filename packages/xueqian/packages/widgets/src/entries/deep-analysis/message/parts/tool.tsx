import { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { getComponents } from "../../markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkParse from "remark-parse";
import {
  BookOpenTextIcon,
  CalculatorIcon,
  CalendarClockIcon,
  ChartPieIcon,
  DatabaseIcon,
  Loader2,
  PencilRulerIcon,
  RouteIcon,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import clsx from "clsx";
import { TextMessagePart } from "./text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const rehypePlugins = [rehypeRaw, rehypeKatex];
const remarkPlugins = [
  remarkMath,
  remarkGfm,
  remarkParse,
  remarkDirective,
  remarkDirectiveRehype,
];

const ToolNameMap = {
  "handoff.query-planning": "查询规划",
  "handoff.query-design": "查询设计",
  "query-data": "数据查询",
  "generate-chart": "图表生成",
  "generate-html-report": "数据分析报告生成",
  "handoff.generate-html-report": "数据分析报告生成",
  "date-format": "日期格式化",
};

const ToolIconMap = {
  "handoff.query-planning": RouteIcon,
  "handoff.query-design": PencilRulerIcon,
  "query-data": DatabaseIcon,
  "generate-chart": ChartPieIcon,
  "handoff.generate-html-report": BookOpenTextIcon,
  "date-format": CalendarClockIcon,
};

export function ToolMessagePart({ message, part, addToolResult }) {
  const components = useRef(getComponents(message));

  if (part.toolInvocation.toolName === "sequential-thinking") {
    if (!part.toolInvocation.args?.thought) {
      return null;
    }
    return (
      <TextMessagePart
        message={message}
        part={{ text: part.toolInvocation.args.thought }}
      />
    );
  }

  // console.log(
  //   "part.toolInvocation.state",
  //   part.toolInvocation.state,
  //   Date.now()
  // );
  // console.log("part.toolInvocation.toolName", part.toolInvocation.toolName);

  const calling = ["partial-call", "call"].includes(part.toolInvocation.state);
  const finished = part.toolInvocation.state === "result";
  const failed =
    part.toolInvocation.state === "result" &&
    part.toolInvocation.result?.isError === true;
  const success = part.toolInvocation.state === "result" && !failed;

  let ToolIcon = ToolIconMap[part.toolInvocation?.toolName] || Wrench;
  let toolName = part.toolInvocation.toolName;
  if (/^math/.test(toolName)) {
    toolName = "数学计算";
    ToolIcon = CalculatorIcon;
  } else if (ToolNameMap[part.toolInvocation.toolName]) {
    toolName = ToolNameMap[part.toolInvocation.toolName];
  }

  const intro = useMemo(() => {
    if (
      ["handoff.query-design", "query-data"].includes(
        part.toolInvocation?.toolName
      )
    ) {
      return part.toolInvocation?.args?.goal || "";
    }
    if (
      "handoff.query-planning" === part.toolInvocation?.toolName &&
      Array.isArray(part.toolInvocation?.result?.tasks)
    ) {
      return `已规划 ${part.toolInvocation?.result?.tasks.length} 条查询任务`;
    }
  }, [part.toolInvocation?.toolName, part.toolInvocation?.args]);

  const toolMessageTitle = (
    <div
      className={clsx(
        "tool-message-title flex gap-1 py-1 items-center w-full",
        success && "text-green-500",
        failed && "text-red-500",
        !success && !failed && "text-yellow-500"
      )}
    >
      {failed && <TriangleAlert className="w-4 h-4" />}
      {calling && <Loader2 className="w-4 h-4 animate-spin" />}
      {success && <ToolIcon className="w-4 h-4" />}
      <span className="shrink-0 whitespace-nowrap">{toolName}</span>
      <div className="grow min-w-2.5 shrink-0"></div>
      <div className="text-xs text-gray-500 text-right overflow-hidden max-w-36">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate whitespace-nowrap">{intro}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{intro}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  const content = `**Input**\n\`\`\`json\n${JSON.stringify(
    part.toolInvocation.args,
    null,
    2
  )}\n\`\`\`\n**Result**\n\`\`\`json
${JSON.stringify(part.toolInvocation.result, null, 2)}
\`\`\``;

  return (
    <Collapsible className="border rounded-md px-2 py-1 bg-white">
      <CollapsibleTrigger className="w-full flex items-center justify-between flex-nowrap">
        {toolMessageTitle}
      </CollapsibleTrigger>
      <CollapsibleContent className="border-1 border-l-0 border-r-0 border-b-0 border-gray-100/90 p-2">
        <div className="tool-message-result overflow-auto">
          {finished && (
            <ReactMarkdown
              components={components.current}
              rehypePlugins={rehypePlugins}
              remarkPlugins={remarkPlugins}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

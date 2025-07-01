// import { getFormFieldsToolFactory } from "./form-fields";
// import { getFormRecordsToolFactory } from "./form-records";
// import { sequentialThinkingToolFactory } from "./sequential-thinking";
// import { generateChartToolFactory } from "./echarts";
// import { generateHtmlReportToolFactory } from "./generate-report";
// import { mathTools } from "./math";
// import { dateTools } from "./date";

// export const getToolsSet = (ctx: any) => {
//   const tools = [
//     getFormFieldsToolFactory(ctx),
//     getFormRecordsToolFactory(ctx),
//     sequentialThinkingToolFactory(ctx),
//     generateChartToolFactory(ctx),
//     generateHtmlReportToolFactory(ctx),
//   ].reduce((prev, curr) => {
//     prev[curr.id] = curr as any;
//     return prev;
//   }, {} as Record<string, ReturnType<typeof getFormFieldsToolFactory>>);

//   return {
//     ...tools,
//     ...mathTools,
//     ...dateTools,
//   };
// };

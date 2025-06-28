import { customProvider } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getConfig } from "../../config/index.js";

const modelNames = [
  "deepseek-chat",
  "QwQ-32B-Friday",
  "qwen-vl-plus-latest",
  "gpt-4o-mini",
  "qwen-turbo-latest",
  "deepseek-v3-friday",
  "Doubao-deepseek-v3",
  "Doubao-deepseek-r1",
  "gpt-4.1-nano",
  "gpt-4.1",
  "gpt-4o-2024-11-20",
  "anthropic.claude-3.7-sonnet",
  "anthropic.claude-sonnet-4",
  "Doubao-Seed-1.6",
];

export function getModel(name: string) {
  const apiKey =
    getConfig("FRIDAY_API_KEY") ||
    process.env.FRIDAY_API_KEY ||
    "21899664734253830219"; // your-api-key

  console.log("apiKey", apiKey);

  const myAIModels = customProvider({
    languageModels: modelNames.reduce((prev, name) => {
      prev[name] = createOpenAI({
        baseURL: "https://aigc.sankuai.com/v1/openai/native",
        apiKey,
      })(name);
      return prev;
    }, {} as any),
  });

  return myAIModels.languageModel(name);
}
